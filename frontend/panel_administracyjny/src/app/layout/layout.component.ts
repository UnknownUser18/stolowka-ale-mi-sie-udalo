import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
@Component({
  selector : 'app-layout',
  imports : [
    RouterOutlet,
    NavComponent,
    SidebarComponent
  ],
  templateUrl : './layout.component.html',
  styleUrl : './layout.component.scss'
})
export class LayoutComponent {

}
