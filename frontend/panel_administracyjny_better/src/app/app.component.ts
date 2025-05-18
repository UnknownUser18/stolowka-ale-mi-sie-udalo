import { Component, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { GlobalInfoService } from './global-info.service';
import { filter, take } from 'rxjs';
import {DataService, Student, TypOsoby} from './data.service';
export type classNames = 'main-page' | 'osoby' | 'all';

@Component({
    selector: 'app-root',
    imports: [NavComponent, NgOptimizedImage, RouterLink, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  protected persons_zsti : Student[] | undefined
  protected readonly TypOsoby = TypOsoby;

  @ViewChild('nav') nav!: ElementRef;
  @ViewChild('scrollable') scrollable!: ElementRef;

  constructor(protected router : Router, protected globalInfoService : GlobalInfoService, private database : DataService, private zone : NgZone) {}
  protected navigate(path : string, class_name : classNames, ignore : boolean = true) : void {
    if (!ignore) {
      this.router.navigate([path]).then();
      return;
    }
    this.animateElement(class_name, true).then((): void => {
      this.router.navigate([path]).then();
    });
  }
  private async animateElement(class_name: classNames, remove: boolean = false): Promise<boolean> {
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
  protected selectPerson(student : Student) : void {
    this.router.navigate(['osoba/zsti', student.id, 'kalendarz']).then((): void => {
      this.globalInfoService.setActiveUser(student);
    });
  }

  private startPageLogic() : void {
    switch (this.router.url) {
      case '/':
        this.globalInfoService.setTitle('Strona Główna');
        this.animateElement('main-page').then((): void => {});
        break;
      case '/osoby':
        this.globalInfoService.setTitle('Osoby');
        this.animateElement('osoby').then((): void => {
          this.database.request('zsti.student.get', {}, 'studentList').then((payload): void => {
            this.persons_zsti = payload;
          });
        });
        break;
    }
    if(this.router.url.startsWith('/osoba')) {
      this.animateElement('osoby').then((): void => {
        this.database.request('zsti.student.get', {}, 'studentList').then((payload): void => {
          this.persons_zsti = payload;
        });
      })
    }
  }

  public ngAfterViewInit(): void {
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
