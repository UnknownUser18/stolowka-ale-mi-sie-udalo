import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { GlobalInfoService } from '../services/global-info.service';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector : 'app-nav',
  imports : [
    RouterLink,
    AsyncPipe
  ],
  templateUrl : './nav.component.html',
  styleUrl : './nav.component.scss',
})
export class NavComponent implements AfterViewInit {

  constructor(
    private cdr : ChangeDetectorRef,
    protected infoService : GlobalInfoService,
    protected router : Router
  ) {}

  public ngAfterViewInit(): void {
    this.infoService.title.subscribe(() => {
      this.cdr.detectChanges();
    });
    this.infoService.activeTab.subscribe(() => {
      this.cdr.detectChanges();
    });
  }
}
