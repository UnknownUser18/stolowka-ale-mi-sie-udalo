import {ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {GlobalInfoService, NotificationType} from '../services/global-info.service';
import {DataService, CanceledDay, WebSocketStatus, Pricing} from '../services/data.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TransitionService} from '../services/transition.service';

@Component({
  selector: 'app-cennik',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './cennik.component.html',
  styleUrl: './cennik.component.scss'
})
export class CennikComponent {  protected pricing_zsti: Pricing[] = [];
  protected id: number = 0;
  private invalidDates : Date[] = [];
  protected showWindow: "" | "add" | "delete" = "";

  protected pricingForm: FormGroup = new FormGroup({
    cena : new FormControl(0, [Validators.required ,Validators.min(0), Validators.max(100)]),
    data_od : new FormControl(this.dateInput(new Date()), Validators.required),
    data_do : new FormControl(this.dateInput(new Date())),
  });

  protected addForm: FormGroup = new FormGroup({
    cena : new FormControl(0, [Validators.required ,Validators.min(0), Validators.max(100)]),
    data_od : new FormControl(this.dateInput(new Date()), Validators.required),
    data_do : new FormControl(this.dateInput(new Date())),
  });

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private infoService : GlobalInfoService,
    private database : DataService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone
  ) {
    this.infoService.setTitle('ZSTI - Cennik');
    this.infoService.webSocketStatus.subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
      this.database.request('zsti.pricing.get', {}, 'pricingList').then((payload: Pricing[]) => {
        this.pricing_zsti = payload;
      });
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
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  }

  protected selectPricing(pricing_zsti : Pricing) {
    console.log(pricing_zsti);
    this.pricingForm.patchValue({
      cena : pricing_zsti.cena,
      data_od : this.dateInput(new Date(pricing_zsti.data_od)),
      date_do : pricing_zsti.data_do ? this.dateInput(new Date(pricing_zsti.data_do)) : null,
    })
    this.id = pricing_zsti.id;
  }

  protected deletePricing(){
    this.database.request('zsti.pricing.delete', {id: this.id}, 'pricingList').then(() => {
      this.id = 0;
      this.reloadPricing()
    })
  }

  protected updatePricing() : void {
    if (this.pricingForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.pricingForm.value;
    const pricing : Pricing = {
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
      this.infoService.generateNotification(NotificationType.WARNING, 'Cennik nie został zmieniony.');
      return;
    }
    if (pricing.data_do && pricing.data_od > pricing.data_do) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    console.log(pricing)
    const method = pricing.data_do ? `zsti.pricing.update` : `zsti.pricing.updateWOdatado`;
    this.database.request(method, pricing, 'dump').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować cennika.');
        return;
      }

      this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został zaktualizowany.');

      this.reloadPricing();
    });
  }
  private reloadPricing() {
    this.database.request('zsti.pricing.get', { }, 'pricingList').then((payload: Pricing[]) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać cenników.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak deklaracji dla tej osoby.');
        this.pricing_zsti = [];
        this.invalidDates = [];
        return;
      }
      this.pricing_zsti = payload;
      this.invalidDates = [];

      this.pricing_zsti.forEach((price) => {
        if (!(price.data_od && price.data_do)) return;
        this.invalidDates.push(new Date(price.data_od), new Date(price.data_do));
      });
    });
  }

  protected formatPrice(price : number): string {
    const data = price.toFixed(2).split('.');
    console.log(data, price);
    return `${data[0]}.${data[1].padEnd(2, '0')} zł`
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
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.addForm.value;
    const pricing : Pricing = {
      cena : formValue.cena!,
      data_od : formValue.data_od!,
      data_do : formValue.data_do ?? null,
    } as any
    if (pricing.data_do && pricing.data_od > pricing.data_do) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    const method = pricing.data_do ? `zsti.pricing.add` : `zsti.pricing.addWOdatado`;
    this.database.request(method, pricing, 'dump').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać cennika.');
        return;
      }

      this.infoService.generateNotification(NotificationType.SUCCESS, 'Cennik został dodany.');
      this.reloadPricing();
    });
  }
}
