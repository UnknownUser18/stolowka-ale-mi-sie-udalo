import { Component } from '@angular/core';
import { MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-unsaved-changes-dialog',
  templateUrl: './unsaved-changes-dialog.component.html',
  styleUrl: './unsaved-changes-dialog.component.css',
  standalone: true,
  imports: [MatDialogContent, MatDialogTitle, MatDialogActions, MatButtonModule, MatDialogClose],
})
export class UnsavedChangesDialogComponent {}
