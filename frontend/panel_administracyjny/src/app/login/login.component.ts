import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { GlobalInfoService } from '../services/global-info.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';


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

  protected loginForm = new FormGroup({
    username : new FormControl(''),
    password : new FormControl(''),
  });

  constructor(
    private router : Router,
    private infoService : GlobalInfoService
  ) {
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
