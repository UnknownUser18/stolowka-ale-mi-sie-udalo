import { Component } from '@angular/core';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-clock',
  imports: [],
  templateUrl: './clock.component.html',
  standalone: true,
  styleUrl: './clock.component.css'
})
export class ClockComponent {
  currentTime: Date = new Date()
  dniTygodnia: string[] = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'So'];
  constructor(protected dataService: DataBaseService) {
    setInterval(() => this.incrementClock(), 1000)
  }

  incrementClock(): void {
    this.currentTime.setSeconds(this.currentTime.getSeconds() + 1);
  }
}
