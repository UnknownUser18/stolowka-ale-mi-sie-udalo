import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransitionService } from '../services/transition.service';
import { VariablesService } from '../services/variables.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {faArrowsRotate, faPlus, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {firstValueFrom} from 'rxjs';
import {DeclarationsService, ZPricing} from '@database/declarations.service';
import {NotificationsService} from '@services/notifications.service';

@Component({
  selector : 'app-cennik',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    FaIconComponent,
  ],
  templateUrl : './cennik.component.html',
  styleUrl : './cennik.component.scss'
})
export class CennikComponent {
  protected pricing_zsti : ZPricing[] | null = null; // TODO: Define proper type for cennik_zsti
  private invalidDates : Date[] = [];

  protected id : number = 0;
  protected showWindow : "" | "add" | "delete" = "";

  protected readonly xmarkClose= faXmark

  protected pricingForm : FormGroup = new FormGroup({
    cena : new FormControl(0, [Validators.required, Validators.min(0)]),
    data_od : new FormControl(this.dateInput(new Date()), Validators.required),
    data_do : new FormControl(this.dateInput(new Date())),
  });

  protected addForm : FormGroup = new FormGroup({
    cena : new FormControl(0, [Validators.required, Validators.min(0)]),
    data_od : new FormControl(this.dateInput(new Date()), Validators.required),
    data_do : new FormControl(this.dateInput(new Date())),
  });

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private variables : VariablesService,
    private infoService : GlobalInfoService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone,
    private declarationS: DeclarationsService,
    private notificationS: NotificationsService
  ) {
    this.infoService.setTitle('ZSTI - Cennik');
    // this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {
      // TODO: Uncomment when backend is ready and when api request is implemented
      // this.database.request('zsti.pricing.get', {}, 'pricingList').then((payload : Pricing[]) => {
      //   this.pricing_zsti = payload;
      // });
    // })
    firstValueFrom(this.declarationS.getPricing()).then(pricing => {
      this.pricing_zsti = pricing;
    })
  }

  protected formatDate(date : string) : string {
    return new Date(date).toLocaleDateString('pl-PL', {
      day : 'numeric',
      month : 'long',
      year : 'numeric',
    });
  }

  protected dateInput(date : Date) : string {
    date = new Date(date);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    console.log(date, `${ year }-${ month }-${ day }`)
    return `${ year }-${ month }-${ day }`;
  }

  protected selectPricing(pricing_zsti : ZPricing) {
    console.log(pricing_zsti);
    this.pricingForm.patchValue({
      cena : pricing_zsti.cena,
      data_od : this.dateInput(new Date(pricing_zsti.data_od)),
      date_do : this.dateInput(new Date(pricing_zsti.data_do)),
    })
    console.log(this.pricingForm, pricing_zsti)
    this.id = pricing_zsti.id;
  }

  protected  deletePricing() {
    firstValueFrom(this.declarationS.deletePricing(this.id)).then(() => {
      this.id = 0;
      this.closeWindow()
      this.reloadPricing()
    });
  }

  protected async updatePricing() {
    if(!this.pricing_zsti)
      return;
    if (this.pricingForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.pricingForm.value;
    const pricing : any = { // TODO: Define proper type for pricing
      id : this.id,
      data_od : formValue.data_od!,
      cena : formValue.cena!,
      data_do : formValue.data_do,
    }
    const original = this.pricing_zsti.find(d => d.id === pricing.id);
    const datesChanged = !!original && (
      this.dateInput(new Date(original.data_od)) !== pricing.data_od ||
      (!original.data_do || this.dateInput(new Date(original.data_do)) !== pricing.data_do)
    );
    if (!(datesChanged) && (original?.cena === pricing.cena)) {
      this.notificationS.createWarningNotification('Cennik nie został zmieniony.', 2.5)
      // this.infoService.generateNotification(NotificationType.WARNING, 'Cennik nie został zmieniony.');
      return;
    }
    if (pricing.data_do && pricing.data_od > pricing.data_do) {
      this.notificationS.createErrorNotification('Data "od" nie może być późniejsza niż data "do".', 3)
      // this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    console.log(pricing)
    const numOfErrDates = await firstValueFrom(this.declarationS.checkPricing(pricing.id, pricing.data_od, pricing.data_do))
    console.log(numOfErrDates)
    if(numOfErrDates === null || numOfErrDates > 0 ) {
      this.notificationS.createErrorNotification('Daty nie mogą nachodzić na te z innych cenników', 3)
      // this.infoService.generateNotification(NotificationType.ERROR, 'Daty nie mogą nachodzić na te z innych cenników');
      return;
    }
    console.log(numOfErrDates)
    firstValueFrom(this.declarationS.updatePricing(pricing.id, pricing.data_od, pricing.data_do, pricing.cena)).then((payload) => {
      if (!payload) {
        this.notificationS.createErrorNotification('Nie udało się zaktualizować cennika.')
        // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować cennika.');
        return;
      }

      this.notificationS.createSuccessNotification('Cennik został zaktualizowany.')
      // this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został zaktualizowany.');

      this.reloadPricing();
    })
    const method = pricing.data_do ? `zsti.pricing.update` : `zsti.pricing.updateWOdatado`;
    // TODO: Uncomment when backend is ready and when api request is implemented
    // this.database.request(method, pricing, 'dump').then((payload) => {
    //   if (!payload || payload.length === 0) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować cennika.');
    //     return;
    //   }
    //
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został zaktualizowany.');
    //
    //   this.reloadPricing();
    // });
  }

  protected reloadPricing() {
    firstValueFrom(this.declarationS.getPricing()).then(pricings => {
      if (!pricings) {
        this.notificationS.createErrorNotification('Nie udało się pobrać cenników.', 3)
        // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać cenników.');
        return;
      } else if (pricings.length === 0) {
        this.notificationS.createErrorNotification('Brak deklaracji dla tej osoby.', 2)
        // this.infoService.generateNotification(NotificationType.WARNING, 'Brak deklaracji dla tej osoby.');
        this.pricing_zsti = [];
        this.invalidDates = [];
        return;
      }
      this.pricing_zsti = pricings;
      this.invalidDates = [];

      this.pricing_zsti.forEach((price) => {
        if (!(price.data_od && price.data_do)) return;
        this.invalidDates.push(new Date(price.data_od), new Date(price.data_do));
      });
    })
  }

  protected closeWindow() : void {
    this.transition.applyAnimation(this.filter.nativeElement, false, this.zone).then(() => {
      this.showWindow = '';
    });
  }

  protected openWindow(type : 'delete' | 'add') : void {
    this.showWindow = type;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.filter.nativeElement, true, this.zone).then();
  }

  protected addPricing() : void {
    if (this.addForm.invalid) {
      this.notificationS.createErrorNotification('Proszę poprawić błędy w formularzu.', 3)
      // this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.addForm.value;
    const pricing : ZPricing = {
      cena : formValue.cena!,
      data_od : formValue.data_od!,
      data_do : formValue.data_do!,
    } as any;

    if (pricing.data_do && pricing.data_od > pricing.data_do) {
      this.notificationS.createErrorNotification('Data "od" nie może być późniejsza niż data "do".', 3)
      // this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    // const method = pricing.data_do ? `zsti.pricing.add` : `zsti.pricing.addWOdatado`;
    firstValueFrom(this.declarationS.addPricing(pricing.data_od, pricing.data_do, pricing.cena)).then(payload => {
      this.closeWindow()
      if (!payload) {
        this.notificationS.createErrorNotification('Nie udało się dodać cennika.', 3)
        // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać cennika.');
        return;
      }

      this.notificationS.createSuccessNotification('Cennik został dodany.', 2)
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został dodany.');
      this.reloadPricing();
    })
    // TODO: Uncomment when backend is ready and when api request is implemented
    // this.database.request(method, pricing, 'dump').then((payload) => {
    //   if (!payload || payload.length === 0) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać cennika.');
    //     return;
    //   }
    //
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został dodany.');
    //   this.reloadPricing();
    // });
  }

  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faPlus = faPlus;
}
