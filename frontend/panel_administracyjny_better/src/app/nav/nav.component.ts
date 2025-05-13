import { Component } from '@angular/core';
import { GlobalInfoService } from '../global-info.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [
    AsyncPipe
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  constructor(protected titleService: GlobalInfoService) {}
}
