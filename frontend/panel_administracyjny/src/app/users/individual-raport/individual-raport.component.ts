import { Component, OnDestroy } from '@angular/core';
import { DataService } from '../../services/data.service';
import { VariablesService } from '../../services/variables.service';
import { GlobalInfoService } from '../../services/global-info.service';
import { Subject } from 'rxjs';

@Component({
  selector : 'app-individual-raport',
  imports : [],
  templateUrl : './individual-raport.component.html',
  styleUrl : './individual-raport.component.scss'
})
export class IndividualRaportComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  protected type : 'korekta' | 'nieobecnosci' | '' = '';
  protected result : any = null;

  constructor(
    private variables : VariablesService,
    private database : DataService,
    private infoService : GlobalInfoService
  ) {
    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {
      this.infoService.activeUser.subscribe(user => {
        if (!user) return;
        this.infoService.setActiveTab('RAPORT');
        this.infoService.setTitle(`${ user.imie } ${ user.nazwisko } - Raport`);
      });
    });
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
