import { Component } from '@angular/core';
import { GlobalInfoService } from '../global-info.service';

@Component({
  selector: 'app-osoby',
  imports: [],
  templateUrl: './osoby.component.html',
  styleUrl: './osoby.component.scss'
})
export class OsobyComponent {
  constructor(private titleService : GlobalInfoService) {
    this.titleService.setTitle('Osoby');
  }
}
