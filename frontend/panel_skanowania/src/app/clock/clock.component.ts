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
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    const dateFormat = new Intl.DateTimeFormat([], options);
    return dateFormat.format(date)
  }

  public getTime(): string {
    return this.formatDate(new Date())
  }
}
