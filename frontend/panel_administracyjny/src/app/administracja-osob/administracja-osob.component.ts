import { Component } from '@angular/core';
import { DataService, Student } from '../services/data.service';
import { VariablesService } from '../services/variables.service';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';

@Component({
  selector : 'app-administracja-osob',
  imports : [],
  templateUrl : './administracja-osob.component.html',
  styleUrl : './administracja-osob.component.scss'
})
export class AdministracjaOsobComponent {

  protected archived_users : Student[] | undefined;

  constructor(
    private variables : VariablesService,
    private database : DataService,
    private infoService : GlobalInfoService,
    protected router : Router
  ) {
    this.infoService.setTitle('Administracja');
    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() : void => {
      this.database.request('archived.zsti.get').then((payload) => {
        if (!payload) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać użytkowników z archiwum.');
          return;
        } else if (payload.length === 0) {
          this.infoService.generateNotification(NotificationType.WARNING, 'Brak użytkowników w archiwum.');
        }
        this.archived_users = payload;
      });
    });

    this.router.events.subscribe((event : any) => {
      if (!(event instanceof NavigationEnd || event instanceof NavigationSkipped)) return;
      const url = event.url.replace('/administracja/', '');
      console.log(url)
      switch (url) {
        case 'users':
          this.infoService.setTitle('Archiwum osób ZSTI - Administracja');
          break;
        case 'klasy':
          this.infoService.setTitle('Klasy - Administracja');
          break;
        case 'dodaj-osobe':
          this.infoService.setTitle('Dodaj osobę - Administracja');
          break;
      }
    });
  }
}
