import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from '@components/navigation/nav/nav';
import { Sidebar } from '@components/sidebar/sidebar';

@Component({
  selector    : 'app-layout',
  imports     : [
    RouterOutlet,
    Nav,
    Sidebar
  ],
  templateUrl : './layout.html',
  styleUrl    : './layout.scss'
})
export class Layout {

}
