import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {DbService} from '../db.service';

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

  constructor(private database: DbService) {
  }

  initRestart(): void {
    this.restart.emit()
    this.database.getZCardsWithDetails()
  }
}
