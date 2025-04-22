import {Component, OnDestroy, AfterViewInit} from '@angular/core';
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
  constructor(protected router : Router, private titleService : GlobalInfoService, private database : DataService) {}
  private routerSubscription!: Subscription;
  protected persons_zsti : Student[] | undefined
  protected navigateMainPage() : void {
    this.router.navigate(['']).then(() : void => {
      this.titleService.setTitle('Strona Główna');
    });
  }
  public ngAfterViewInit(): void {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl : string = event.urlAfterRedirects;
        switch (currentUrl) {
          case '/osoby':
            this.titleService.setTitle('Osoby');
            this.database.request('zsti.student.get',{},'studentList')
            setTimeout(() : void => {
              this.persons_zsti = this.database.get('studentList');
            }, 1000); // make this function async 😭😭😭😭😭😭
            break;
        }
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
