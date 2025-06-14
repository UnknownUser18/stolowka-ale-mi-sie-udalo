import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { NgOptimizedImage } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { GlobalInfoService, NotificationType } from './services/global-info.service';
import { filter, take } from 'rxjs';
import { DataService, Opiekun, Student, TypOsoby, WebSocketStatus } from './services/data.service';
import { TransitionService } from './services/transition.service';
import { VariablesService } from './services/variables.service';

export type classNames = 'main-page' | 'osoby' | 'all' | 'cennik' | 'nieczynne' | 'raporty';

@Component({
  selector : 'app-root',
  imports : [NavComponent, NgOptimizedImage, RouterLink, RouterOutlet],
  templateUrl : './app.component.html',
  styleUrl : './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  protected persons_zsti : (Student & Opiekun)[] | undefined
  protected readonly TypOsoby = TypOsoby;

  @ViewChild('nav') nav! : ElementRef;
  @ViewChild('scrollable') scrollable! : ElementRef;

  constructor(
    private variables : VariablesService,
    private database : DataService,
    private zone : NgZone,
    private transition : TransitionService,
    protected router : Router,
    protected infoService : GlobalInfoService) {
    this.database.initializeWebSocket().then(status => {
      this.infoService.setWebSocketStatus(status);
    });
    this.infoService.webSocketStatus.subscribe(status => {
      if (status === WebSocketStatus.ERROR) this.infoService.generateNotification(NotificationType.ERROR, 'Bład podczas łączenia się z bazą danych.')
      if (status !== WebSocketStatus.OPEN) return;
    })
  }

  private async animateElement(class_name : classNames, remove : boolean = false) : Promise<boolean> {
    await this.transition.waitForAllTransitions();
    return new Promise((resolve, reject) : void => {
      const element : HTMLElement = this.nav.nativeElement.querySelector(`.${ class_name }`)!;
      if (!element) {
        reject('Element not found');
        return;
      }
      element.classList.toggle('done', !remove);
      element.addEventListener('transitionend', () : void => {
        resolve(true);
      });
    });
  };

  private startPageLogic() : void {
    switch (this.router.url) {
      case '/':
        this.infoService.setTitle('Strona Główna');
        this.animateElement('main-page').then();
        break;
      case '/osoby/zsti':
      case '/osoby':
        if (this.router.url === '/osoby') {
          this.infoService.setTitle('Osoby');
        }
        this.animateElement('osoby').then(() : void => {
          if (this.persons_zsti) return;
          this.variables.mapStudentsToOpiekun().then((persons : (Student & Opiekun)[]) => {
            this.persons_zsti = persons;
          });
        });
        break;
      case '/raporty':
        this.infoService.setTitle('Raporty');
        this.animateElement('raporty').then();
        break;
      case '/cennik':
        this.infoService.setTitle('Cennik');
        this.animateElement('cennik').then();
        break;
      case '/nieczynne':
        this.infoService.setTitle('Dni Nieczynne');
        this.animateElement('nieczynne').then();
    }
    if (this.router.url.startsWith('/osoba')) {
      this.animateElement('osoby').then()
    } else if (this.router.url.startsWith('/cennik')) {
      this.animateElement('cennik').then()
    } else if (this.router.url.startsWith('/nieczynne')) {
      this.animateElement('nieczynne').then()
    }
  }

  protected navigate(path : string, class_name : classNames, ignore : boolean = true) : void {
    if (!ignore) {
      this.router.navigate([path]).then();
      return;
    }
    this.animateElement(class_name, true).then(() : void => {
      this.router.navigate([path]).then();
    });
  }

  protected selectPerson(student : Student & Opiekun) : void {
    this.router.navigate(['osoba/zsti', student.id, 'kalendarz']).then(() : void => {
      this.infoService.setActiveUser(student);
    });
  }


  public ngAfterViewInit() : void {
    const mainPage : HTMLElement = this.scrollable.nativeElement.querySelector('.main-page')!;
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
