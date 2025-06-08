import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-restart',
  imports: [
    MatIcon,
  ],
  templateUrl: './restart.component.html',
  styleUrl: './restart.component.scss',
  standalone: true
})
export class RestartComponent {
  @ViewChild(MatIcon, { static: true }) icon!: MatIcon;
  @Input() isDisabled: boolean = false;
  @Output() restart: EventEmitter<void> = new EventEmitter();

  initRestart(): void {
    this.restart.emit()
  }
}
