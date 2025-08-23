import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { GlobalInfoService } from './services/global-info.service';
import { TransitionService } from './services/transition.service';
import { VariablesService } from './services/variables.service';
import { PersonsService } from './services/database/persons.service';

export type classNames = 'main-page' | 'osoby' | 'all' | 'cennik' | 'nieczynne' | 'raporty' | 'administracja';

@Component({
  selector : 'app-root',
  imports : [RouterOutlet],
  templateUrl : './app.component.html',
  styleUrl : './app.component.scss'
})
export class AppComponent {
  // protected persons_zsti : (Student & Opiekun)[] | undefined
  // protected readonly TypOsoby = TypOsoby;

  @ViewChild('nav') nav! : ElementRef;
  @ViewChild('scrollable') scrollable! : ElementRef;

  constructor(
    private variables : VariablesService,
    private zone : NgZone,
    private transition : TransitionService,
    protected router : Router,
    protected infoService : GlobalInfoService,
    private personsS : PersonsService) {
    this.personsS.getZPersons().subscribe()
    // this.database.initializeWebSocket().then(status => {
    //   this.infoService.setWebSocketStatus(status);
    // });
    // this.infoService.webSocketStatus.subscribe(status => {
    //   if (status === WebSocketStatus.ERROR) this.infoService.generateNotification(NotificationType.ERROR, 'Bład podczas łączenia się z bazą danych.')
    // })
  }

  private async animateElement(class_name : classNames, remove : boolean = false) : Promise<boolean> {
    await this.transition.waitForAllTransitions();
    return new Promise((resolve, reject) : void => {
      const element : HTMLElement = this.nav.nativeElement.querySelector(`.${ class_name }`)!;
      if (!element) {
        reject('Element not found');
        return;
      }
      element.classList.toggle('done', !remove);
      element.addEventListener('transitionend', () : void => {
        resolve(true);
      });
    });
  };

  private async startPageLogic() : Promise<void> {
    const url = this.router.url;
    if (url === '/') {
      this.infoService.setTitle('Strona Główna');
      await this.animateElement('main-page');
      return;
    }

    if (url.startsWith('/osoby') || url.startsWith('/osoba')) {
      if (url === '/osoby')
        this.infoService.setTitle('Osoby');

      this.animateElement('osoby').then(() : void => {
        // if (this.persons_zsti) return;

        // this.infoService.webSocketStatus.subscribe(async (status) => {
        //   if (status !== WebSocketStatus.OPEN) return;
        //   this.persons_zsti = await this.variables.mapStudentsToOpiekun();
        // });
      });
      return;
    }
    if (url.startsWith('/cennik')) {
      this.infoService.setTitle('Cennik');
      await this.animateElement('cennik');
      return;
    }
    if (url.startsWith('/nieczynne')) {
      this.infoService.setTitle('Dni Nieczynne');
      await this.animateElement('nieczynne');
      return;
    }
    if (url.startsWith('/raporty')) {
      await this.animateElement('raporty');
      return;
    }
    if (url.startsWith('/administracja')) {
      await this.animateElement('administracja');
      return;
    }
  }

  protected navigate(path : string, class_name : classNames, ignore : boolean = true) : void {
    if (!ignore) {
      this.router.navigate([path]).then();
      return;
    }
    this.animateElement(class_name, true).then(() : void => {
      this.router.navigate([path]).then();
    });
  }

  // protected selectPerson(student : Student & Opiekun) : void {
  //   this.router.navigate(['osoba/zsti', student.id, 'kalendarz']).then(() : void => {
  //     this.infoService.setActiveUser(student);
  //   });
  // }


  // public ngAfterViewInit() : void {
  //   const mainPage : HTMLElement = this.scrollable.nativeElement.querySelector('.main-page')!;
  //   mainPage.classList.add('done');
  //   this.router.events
  //     .pipe(filter(e => e instanceof NavigationEnd))
  //     .subscribe(() => {
  //       this.zone.onStable.pipe(take(1)).subscribe(() => {
  //         requestAnimationFrame(() => {
  //           this.startPageLogic().then();
  //         });
  //       });
  //     });
  // }
}
