import { Component } from '@angular/core';
import { GlobalInfoService, TabTypeKey } from '../global-info.service';
import { Router, RouterLink } from '@angular/router';
import { delay } from 'rxjs';

@Component({
  selector : 'app-nav',
  imports : [
    RouterLink
  ],
  templateUrl : './nav.component.html',
  styleUrl : './nav.component.scss',
})
export class NavComponent {
  protected title : string = 'Strona główna';
  protected tab : TabTypeKey | undefined = undefined;
  constructor(
    protected infoService : GlobalInfoService,
    protected router : Router
  ) {
    this.infoService.title.pipe(delay(0)).subscribe(title => {
      this.title = title;
    });

    this.infoService.activeTab.pipe(delay(0)).subscribe(tab => {
      this.tab = tab;
    });
  }
}
