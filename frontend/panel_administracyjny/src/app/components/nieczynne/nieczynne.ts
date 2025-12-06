import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GlobalInfoService } from '@services/global-info.service';
import { TransitionService } from '@services/transition.service';
import { VariablesService } from '@services/variables.service';
import { DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faCircle, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { ClosedDay, Declarations } from '@database/declarations/declarations';
import { firstValueFrom } from 'rxjs';
import { Notifications } from '@services/notifications';

// import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector : 'app-nieczynne',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    FaIconComponent,
  ],
  templateUrl : './nieczynne.html',
  styleUrl    : './nieczynne.scss',
})
export class Nieczynne {
  private invalidDates : Date[] = [];

  protected canceled_days_zsti : ClosedDay[] | null = null;
  protected id : number | null = null;
  protected showWindow : "" | "add" | "delete" = "";

  protected readonly xmarkClose= faXmark

  protected pricingForm : FormGroup = new FormGroup({
    dzien : new FormControl(this.dateInput(new Date()), Validators.required),
  });

  protected addForm : FormGroup = new FormGroup({
    dzien : new FormControl(this.dateInput(new Date()), Validators.required),
  });

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private variables : VariablesService,
    private infoService : GlobalInfoService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone,
    private declarationS : Declarations,
    private notificationS : Notifications
  ) {
    this.infoService.setTitle('ZSTI - Dni Nieczynne');
    firstValueFrom(this.declarationS.getClosedDays).then(value => this.canceled_days_zsti = value);
  }

  protected dateInput(date : Date) : string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  }

  protected selectPricing(canceled_day : ClosedDay) {
    this.pricingForm.patchValue({
      dzien : this.dateInput(new Date(canceled_day.dzien)),
    })
    this.id = canceled_day.id;
  }

  protected deletePricing() {
    if(!this.id) return
    this.declarationS.deleteClosedDay(this.id).subscribe((res) => {
      this.closeWindow()
      if (!res) {
        this.notificationS.createErrorNotification( 'Nie udało się usunąć nieczynnego dnia.', 3)
        // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się usunąć nieczynnego dnia.');
        return;
      }

      this.notificationS.createSuccessNotification( 'Dzień nieczynny został usunięty.', 2)
      // this.infoService.generateNotification(NotificationType.SUCCESS, 'Dzień nieczynny został usunięty.');
      this.reloadPricing();
  });
  }

  protected reloadPricing() {
    this.id = null
    firstValueFrom(this.declarationS.getClosedDays).then((days: ClosedDay[] | null) => {
      if (!days) {
        this.notificationS.createErrorNotification( 'Nie udało się pobrać cenników.', 3)
        // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać cenników.');
        return;
      } else if (days.length === 0) {
        this.notificationS.createErrorNotification( 'Brak dni nieczynnych.', 2.5)
        // this.infoService.generateNotification(NotificationType.WARNING, 'Brak dni nieczynnych.');
        this.canceled_days_zsti = [];
        this.invalidDates = [];
        return;
      }
      this.canceled_days_zsti = days;
      this.invalidDates = [];
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

  protected addCanceledDay() : void {
    if (this.addForm.invalid) {
      this.notificationS.createErrorNotification( 'Proszę poprawić błędy w formularzu.', 3)
      // this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.addForm.value;
    const canceledDay : ClosedDay = {
      id: 0,
      dzien : formValue.dzien!,
    };
    // this.database.request('global.canceledDay.add', canceledDay, 'dump').then((payload) => {
    //   if (!payload || payload.length === 0) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać nieczynnego dnia.');
    //     return;
    //   }
    //
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Dzień nieczynny został dodany.');
    //   this.reloadPricing();
    // });
    this.declarationS.addClosedDay(canceledDay.dzien).subscribe((res) => {
      this.closeWindow()
        if(!res){
          this.notificationS.createErrorNotification( 'Nie udało się dodać nieczynnego dnia.', 3)
          // this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać nieczynnego dnia.');
          return;
        }

        this.notificationS.createSuccessNotification( 'Dzień nieczynny został dodany.', 2)
        // this.infoService.generateNotification(NotificationType.SUCCESS, 'Dzień nieczynny został dodany.');
        this.reloadPricing();
      }
    )
  }

  protected readonly faCircle = faCircle;
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faPlus = faPlus;
}

