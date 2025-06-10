import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { GlobalInfoService } from '../global-info.service';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector : 'app-login',
  imports : [
    ReactiveFormsModule
  ],
  templateUrl : './login.component.html',
  styleUrl : './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  private destroy$ : Subject<void> = new Subject();

  constructor(
    private database : DataService,
    private router : Router,
    private infoService : GlobalInfoService
  ) {
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
