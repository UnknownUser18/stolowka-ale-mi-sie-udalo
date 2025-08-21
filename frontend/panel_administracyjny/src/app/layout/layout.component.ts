import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faWarning } from '@fortawesome/free-solid-svg-icons';
import { NavComponent } from '../nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
@Component({
  selector : 'app-layout',
  imports : [
    RouterOutlet,
    NgOptimizedImage,
    FaIconComponent,
    NavComponent,
    RouterLink,
    SidebarComponent
  ],
  templateUrl : './layout.component.html',
  styleUrl : './layout.component.scss'
})
export class LayoutComponent {

}
