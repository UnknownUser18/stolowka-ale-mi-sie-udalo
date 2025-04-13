import { Component } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { GlobalInfoService } from './global-info.service';

@Component({
    selector: 'app-root',
  imports: [NavComponent, NgOptimizedImage, RouterLink, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  private title : string = 'panel_administracyjny_better';
  constructor(private router : Router, private titleService : GlobalInfoService) {}

  navigateMainPage() : void {
    this.router.navigate(['']).then(() : void => {
      this.titleService.setTitle('Strona Główna');
    });
  }
}
