import {Component, OnDestroy, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { GlobalInfoService } from './global-info.service';
import { Subscription } from 'rxjs';
import { DataService, Student } from './data.service';
@Component({
    selector: 'app-root',
  imports: [NavComponent, NgOptimizedImage, RouterLink, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('nav') nav!: ElementRef;
  constructor(protected router : Router, protected globalInfoService : GlobalInfoService, private database : DataService) {}
  private routerSubscription!: Subscription;
  private async animateElement(class_name: string, remove: boolean): Promise<boolean> {
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
  protected persons_zsti : Student[] | undefined
  protected navigateMainPage() : void {
    this.animateElement('osoby', true).then((r : boolean) : void => {
      if(!r) return;
      this.router.navigate(['']).then(() : void => {
        setTimeout(() => {
          this.globalInfoService.setTitle('Strona Główna');
          this.animateElement('main-page', false).then()
        }, 100);
      });
    });
  }
  protected navigateOsoby() : void {
    this.animateElement('main-page', true).then((r : boolean) : void => {
      if(!r) return;
      this.router.navigate(['osoby']).then(() : void => {
        this.globalInfoService.setTitle('Osoby');
      });
    });
  }
  protected getPersonById(id: number): Student | undefined {
    return this.persons_zsti?.find((person: Student) : boolean => person.id === id);
  }
  protected selectPerson(id : number) : void {
    this.router.navigate(['osoba/zsti', id, 'kalendarz']).then((): void => {
      this.globalInfoService.setActiveUser(id);
    });
  }

  public ngAfterViewInit(): void {
    const mainPage : HTMLElement = this.nav.nativeElement.querySelector('.main-page')!;
    mainPage.classList.add('done');
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl : string = event.urlAfterRedirects;
        setTimeout(() : void => {
          switch (currentUrl) {
            case '/osoby':
              this.globalInfoService.setTitle('Osoby');
              this.animateElement('osoby', false).then(() : void => {
                this.database.request('zsti.student.get',{},'studentList').then((payload) : void => {
                  this.persons_zsti = payload;
                });
              });
              break;
          }
        }, 100)
      }
    });
  }
  public ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
