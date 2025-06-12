import {ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CanceledDay, DataService, Pricing, WebSocketStatus} from '../data.service';
import {GlobalInfoService, NotificationType} from '../global-info.service';
import {TransitionService} from '../transition.service';

@Component({
  selector: 'app-nieczynne',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './nieczynne.component.html',
  styleUrl: './nieczynne.component.scss'
})
export class NieczynneComponent {
  protected canceled_days_zsti: CanceledDay[] = [];
  protected id: number = 0;
  private invalidDates : Date[] = [];
  protected showWindow: "" | "add" | "delete" = "";

  protected pricingForm: FormGroup = new FormGroup({
    dzien : new FormControl(this.dateInput(new Date()), Validators.required),
  });

  protected addForm: FormGroup = new FormGroup({
    dzien : new FormControl(this.dateInput(new Date()), Validators.required),
  });

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private infoService : GlobalInfoService,
    private database : DataService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone
  ) {
    this.infoService.setTitle('ZSTI - Dni Nieczynne');
    this.infoService.webSocketStatus.subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
      this.database.request('global.canceledDay.get', {}, 'canceledDayList').then((payload: CanceledDay[]) => {
        this.canceled_days_zsti = payload;
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

  protected selectPricing(canceled_day : CanceledDay) {
    console.log(canceled_day);
    this.pricingForm.patchValue({
      dzien : this.dateInput(new Date(canceled_day.dzien)),
    })
    this.id = canceled_day.id;
  }

  protected deletePricing(){
    this.database.request('global.canceledDay.delete', {id: this.id}, 'canceledDayList').then(() => {
      this.id = 0;
      this.reloadPricing()
    })
  }

  private reloadPricing() {
    this.database.request('global.canceledDay.get', { }, 'canceledDayList').then((payload: CanceledDay[]) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać cenników.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak dni nieczynnych.');
        this.canceled_days_zsti = [];
        this.invalidDates = [];
        return;
      }
      this.canceled_days_zsti = payload;
      this.invalidDates = [];

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

  protected addCanceledDay() : void {
    if (this.addForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.addForm.value;
    const canceledDay : CanceledDay = {
      dzien : formValue.dzien!,
    } as CanceledDay;
    this.database.request('global.canceledDay.add', canceledDay, 'dump').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać nieczynnego dnia.');
        return;
      }

      this.infoService.generateNotification(NotificationType.SUCCESS, 'Dzień nieczynny został dodany.');
      this.reloadPricing();
    });
  }
}

