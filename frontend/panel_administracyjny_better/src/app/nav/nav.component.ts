import { Component } from '@angular/core';
import { GlobalInfoService } from '../global-info.service';

@Component({
  selector: 'app-nav',
  imports: [],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  constructor(protected titleService: GlobalInfoService) {}
}
