import { ChangeDetectorRef, Component, DEFAULT_CURRENCY_CODE, effect, ElementRef, NgZone, signal, ViewChild } from '@angular/core';
import { GlobalInfoService, NotificationType } from '@services/global-info.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransitionService } from '@services/transition.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { faArrowsRotate, faFileInvoiceDollar, faFilter, faPaperPlane, faPlus, faRotate, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { firstValueFrom } from 'rxjs';
import { DeclarationsService } from '@database/declarations.service';
import { NotificationsService } from '@services/notifications.service';
import { PricesService, ZPricing } from "@database/prices.service";
import { IsSelectedPricePipe } from "@pipes/is-selected-price.pipe";
import { CalendarComponent } from "@calendar";

@Component({
  selector : 'app-cennik',
  imports   : [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    FaIconComponent,
    IsSelectedPricePipe,
    CalendarComponent
  ],
  providers : [
    { provide : DEFAULT_CURRENCY_CODE, useValue : 'PLN' },
    DatePipe
  ],
  templateUrl : './cennik.component.html',
  styleUrl : './cennik.component.scss'
})
export class CennikComponent {
  protected ZPricing : ZPricing[] | null = null;
  protected wrongDaysInCalendar = false;

  protected ZPricingWithoutCena : Omit<ZPricing, 'cena'>[] | null = null;

  protected showWindow : "" | "add" | "delete" = "";

  protected readonly selectedPricing = signal<ZPricing | null>(null);
  protected readonly tempSelectedPricing = signal<ZPricing | null>(null);

  protected isLoading = false;

  protected pricingForm : FormGroup = new FormGroup({
    cena    : new FormControl('', [Validators.required, Validators.min(0)]),
    data_od : new FormControl('', Validators.required),
    data_do : new FormControl('', Validators.required),
  });

  protected addForm : FormGroup = new FormGroup({
    cena    : new FormControl('', [Validators.required, Validators.min(0)]),
    data_od : new FormControl('', Validators.required),
    data_do : new FormControl('', Validators.required),
  });

  protected readonly xmarkClose = faXmark
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faPlus = faPlus;
  protected readonly faFilter = faFilter;
  protected readonly faFileInvoiceDollar = faFileInvoiceDollar;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faRotate = faRotate;
  protected readonly faTrash = faTrash;

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private pricesS : PricesService,
    private datePipe : DatePipe,
    private infoService : GlobalInfoService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone,
    private declarationS : DeclarationsService,
    private notificationS : NotificationsService
  ) {
    this.fetchPricing();

    effect(() => {
      this.selectedPricing();

      const selected = this.selectedPricing();
      if (!selected) return;

      this.pricingForm.setValue({
        cena    : selected.cena,
        data_od : this.datePipe.transform(selected.data_od, 'yyyy-MM-dd'),
        data_do : this.datePipe.transform(selected.data_do, 'yyyy-MM-dd'),
      });

      this.updateCalendar();
    });
  }

  protected hasWrongDays(event : boolean) {
    this.wrongDaysInCalendar = event;
  }

  protected updateCalendar() {
    const { cena, data_od, data_do } = this.pricingForm.value;

    if (!this.selectedPricing()) return;

    if (!cena || !data_od || !data_do || data_od === '' || data_do === '') {
    }

    this.tempSelectedPricing.set({
      ...this.selectedPricing()!,
      cena,
      data_od : new Date(data_od),
      data_do : new Date(data_do),
    });
  }

  protected fetchPricing() {
    this.isLoading = true;

    this.pricesS.getPricing.subscribe(pricing => {
      if (!pricing) {
        this.notificationS.createErrorNotification('Nie udało się pobrać cenników.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.')
      } else if (pricing.length === 0) {
        this.notificationS.createWarningNotification('Brak cenników w bazie danych.', 5);
      } else {
        this.notificationS.createSuccessNotification('Pobrano cenniki z bazy danych.');
      }

      this.ZPricing = pricing;
      this.ZPricingWithoutCena = pricing?.map(({ cena, ...rest }) => rest) || null;
      this.isLoading = false;
    });
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

  protected deletePricing() {
    // firstValueFrom(this.declarationS.deletePricing(this.id)).then(() => {
    //   this.id = 0;
    //   this.closeWindow()
    //   this.fetchPricing()
    // });
  }

  protected async updatePricing() {
    if (!this.ZPricing)
      return;
    if (this.pricingForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.pricingForm.value;
    const pricing : any = { // TODO: Define proper type for pricing
      // id : this.id,
      data_od : formValue.data_od!,
      cena : formValue.cena!,
      data_do : formValue.data_do,
    }
    const original = this.ZPricing.find(d => d.id === pricing.id);
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
    if (numOfErrDates === null || numOfErrDates > 0) {
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

      this.fetchPricing();
    });
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
      this.fetchPricing();
    })
  }

  protected resetForm() {

  }

}
