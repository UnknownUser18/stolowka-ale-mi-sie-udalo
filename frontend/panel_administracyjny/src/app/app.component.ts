import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { GlobalInfoService, NotificationType } from './global-info.service';
import { filter, take } from 'rxjs';
import { DataService, Student, TypOsoby, WebSocketStatus } from './data.service';
import { TransitionService } from './transition.service';

export type classNames = 'main-page' | 'osoby' | 'raporty' | 'all';

@Component({
  selector: 'app-root',
  imports: [NavComponent, NgOptimizedImage, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  protected persons_zsti: Student[] | undefined
  protected readonly TypOsoby = TypOsoby;

  @ViewChild('nav') nav!: ElementRef;
  @ViewChild('scrollable') scrollable!: ElementRef;

  constructor(
    private database: DataService,
    private zone: NgZone,
    private transition: TransitionService,
    protected router: Router,
    protected infoService: GlobalInfoService) {
    this.database.initializeWebSocket().then(status => {
      this.infoService.setWebSocketStatus(status);
    });
    this.infoService.webSocketStatus.subscribe(status => {
      if (status === WebSocketStatus.ERROR) this.infoService.generateNotification(NotificationType.ERROR, 'Bład podczas łączenia się z bazą danych.')
      if (status !== WebSocketStatus.OPEN) return;
      const lastUser = localStorage.getItem('activeUser');
      if (!lastUser) return;
      const url = this.router.url;

      if (url.includes('null')) {
        const newUrl = url.replace('null', lastUser);
        this.database.request('zsti.student.getById', {id: parseInt(lastUser)}, 'studentList').then((payload): void => {
          if (!payload || payload.length === 0) return;
          this.infoService.setActiveUser(payload[0]);
          this.router.navigateByUrl(newUrl).then();
        });
      }
    })
  }

  protected navigate(path: string, class_name: classNames, ignore: boolean = true): void {
    if (!ignore) {
      this.router.navigate([path]).then();
      return;
    }
    this.animateElement(class_name, true).then((): void => {
      this.router.navigate([path]).then();
    });
  }

  private async animateElement(class_name: classNames, remove: boolean = false): Promise<boolean> {
    await this.transition.waitForAllTransitions();
    return new Promise((resolve, reject): void => {
      const element: HTMLElement = this.nav.nativeElement.querySelector(`.${class_name}`)!;
      if (!element) {
        reject('Element not found');
        return;
      }
      element.classList.toggle('done', !remove);
      element.addEventListener('transitionend', (): void => {
        resolve(true);
      });
    });
  };

  protected selectPerson(student: Student): void {
    this.router.navigate(['osoba/zsti', student.id, 'kalendarz']).then((): void => {
      this.infoService.setActiveUser(student);
    });
  }

  private startPageLogic(): void {
    switch (this.router.url) {
      case '/':
        this.infoService.setTitle('Strona Główna');
        this.animateElement('main-page').then((): void => {
        });
        break;
      case '/osoby':
        this.infoService.setTitle('Osoby');
        this.animateElement('osoby').then((): void => {
          this.database.request('zsti.student.get', {}, 'studentList').then((payload): void => {
            this.persons_zsti = payload;
          });
        });
        break;
      case '/raporty':
        this.infoService.setTitle('Raporty');
        this.animateElement('raporty').then();
        break;
    }
    if (this.router.url.startsWith('/osoba')) {
      this.animateElement('osoby').then((): void => {
        this.database.request('zsti.student.get', {}, 'studentList').then((payload): void => {
          this.persons_zsti = payload;
        });
      })
    }
  }

  public ngAfterViewInit(): void {
    const mainPage: HTMLElement = this.scrollable.nativeElement.querySelector('.main-page')!;
    mainPage.classList.add('done');
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.zone.onStable.pipe(take(1)).subscribe(() => {
          requestAnimationFrame(() => {
            this.startPageLogic();
          });
        });
      });
  }

}
