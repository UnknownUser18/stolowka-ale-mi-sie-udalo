import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-osoby',
  imports : [
    RouterOutlet
  ],
  templateUrl : './osoby.html',
  styleUrl    : './osoby.scss',
  host : {
    "[class.top]": "router.url === '/osoby/zsti'"
  }
})
export class Osoby {

  constructor(protected router : Router) {
  }

}
