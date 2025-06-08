import { Component } from '@angular/core';

@Component({
  selector: 'app-clock',
  imports: [],
  templateUrl: './clock.component.html',
  standalone: true,
  styleUrl: './clock.component.scss'
})
export class ClockComponent {
  protected time: string = this.getTime();

  constructor() {
    setInterval(() => this.time = this.getTime(), 1000);
  }

  private formatDate(date: Date): string {
    return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  public getTime(): string {
    return this.formatDate(new Date())
  }
}
