import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-osoby',
  imports : [
    RouterOutlet
  ],
  templateUrl: './osoby.component.html',
  styleUrl: './osoby.component.scss',
  host : {
    "[class.top]": "router.url === '/osoby/zsti'"
  }
})
export class OsobyComponent {

  constructor(protected router : Router) {
  }

}
