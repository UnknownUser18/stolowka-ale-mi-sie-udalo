import { Component } from '@angular/core';
import { GlobalInfoService } from '../global-info.service';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-nav',
  imports: [
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  constructor(protected infoService: GlobalInfoService, protected router: Router) {}
}
