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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear().toString().padStart(2, '0')}`;
  }

  public getTime(): string {
    return this.formatDate(new Date())
  }
}
