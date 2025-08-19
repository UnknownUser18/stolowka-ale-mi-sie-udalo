import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { GlobalInfoService, NotificationType } from '../../services/global-info.service';
import { TransitionService } from '../../services/transition.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { wynikString } from '../zsti/zsti.component';
import { VariablesService } from '../../services/variables.service';

@Component({
  selector : 'app-platnosci',
  imports : [
    ReactiveFormsModule
  ],
  templateUrl : './platnosci.component.html',
  styleUrl : './platnosci.component.scss'
})
export class PlatnosciComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private id : number = 0;
  private user_id : number = 0;

  protected showWindow : '' | 'add' | 'delete' | 'filter' = '';
  // protected result : Payment[] = [];
  // protected payments : Payment[] = [];

  protected platnosciForm = this.createForm();

  protected addForm = this.createForm(true);

  protected filterForm = new FormGroup({
    miesiac_rok : new FormControl('', [Validators.pattern('^(0[1-9]|1[0-2])-(\\d{4})$')]),
    platnosc : new FormControl('', [Validators.min(0), Validators.pattern('^\\d+(\\.\\d{1,2})?$')]),
    dataZaplaty : new FormControl('', [Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]),
    opis : new FormControl('', [Validators.maxLength(200)])
  });

  @ViewChild('window') window! : ElementRef;

  constructor(
    private variables : VariablesService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone,
    protected infoService : GlobalInfoService) {
    // this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() : void => {
    //
    //   this.infoService.activeUser.pipe(takeUntil(this.destroy$)).subscribe(user => {
    //     if (!user) return;
    //     this.user_id = user.id;
    //     this.infoService.setTitle(`${ user.imie } ${ user.nazwisko } - Płatności`);
    //     this.infoService.setActiveTab('PLATNOSCI');
    //     this.reloadPayments();
    //   });
    // });
  }

  private createForm(use_date : boolean = false) : FormGroup {
    if (use_date) {
      const date = new Date();
      const formattedDate = `${ date.getFullYear().toString().padStart(4, '0') }-${ (date.getMonth() + 1).toString().padStart(2, '0') }-${ date.getDate().toString().padStart(2, '0') }`;
      return new FormGroup({
        miesiac_rok : new FormControl('', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])-(\\d{4})$')]),
        platnosc : new FormControl('', [Validators.required, Validators.min(0), Validators.pattern('^\\d+(\\.\\d{1,2})?$')]),
        dataZaplaty : new FormControl(formattedDate, [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]),
        opis : new FormControl('', [Validators.maxLength(200)])
      });
    }
    return new FormGroup({
      miesiac_rok : new FormControl('', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])-(\\d{4})$')]),
      platnosc : new FormControl('', [Validators.required, Validators.min(0), Validators.pattern('^\\d+(\\.\\d{1,2})?$')]),
      dataZaplaty : new FormControl('', [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]),
      opis : new FormControl('', [Validators.maxLength(200)])
    });
  }

  private reloadPayments() : void {
    // this.database.request('zsti.payment.getById', { id_ucznia : this.infoService.activeUser.value?.id }, 'paymentList').then((payload) : void => {
    //   if (!payload) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać płatności.');
    //     return;
    //   } else if (payload.length === 0) {
    //     this.infoService.generateNotification(NotificationType.WARNING, 'Brak płatności dla tej osoby.');
    //     this.result = this.payments = [];
    //     return;
    //   }
    //
    //   this.result = this.payments = payload;
    //   this.result = this.result.sort((a, b) => a.id - b.id);
    // });
  }

  protected checkForFilters() : boolean {
    return !!(this.filterForm.value.miesiac_rok ||
      this.filterForm.value.platnosc ||
      this.filterForm.value.dataZaplaty ||
      this.filterForm.value.opis);
  }

  protected formatMonth(month : number) : string {
    return new Date(0, month - 1).toLocaleString('pl-PL', { month : 'long' });
  }

  protected formatDate(date : string) : string {
    if (/^\d{2}-\d{4}$/.test(date)) {
      const [month, year] = date.split('-');
      return `${ new Date(Number(year), Number(month) - 1).toLocaleString('pl-PL', { month : 'long' }) } ${ year }`;
    }

    return new Date(date).toLocaleDateString('pl-PL', {
      year : 'numeric',
      month : 'long',
      day : 'numeric'
    });
  }

  // protected selectPayment(payment : Payment) : void {
  //   const date = new Date(payment.data_platnosci);
  //   this.platnosciForm.patchValue({
  //     miesiac_rok : `${ payment.miesiac.toString().padStart(2, '0') }-${ payment.rok }`,
  //     platnosc : payment.platnosc.toFixed(2),
  //     dataZaplaty : `${ date.getFullYear().toString().padStart(4, '0') }-${ (date.getMonth() + 1).toString().padStart(2, '0') }-${ date.getDate().toString().padStart(2, '0') }`,
  //     opis : payment.opis
  //   });
  //   this.id = payment.id;
  // }

  protected updatePayment() : void {
    if (this.platnosciForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }

    const formValue = this.platnosciForm.value;
    const monthYear = formValue.miesiac_rok?.split('-')!;
    const month = parseInt(monthYear[0], 10);
    const year = parseInt(monthYear[1], 10);
    // const originalPayment = this.payments.find(p => p.id === this.id);
    // if (!originalPayment) {
    //   this.infoService.generateNotification(NotificationType.ERROR, 'Nie znaleziono płatności do aktualizacji.');
    //   return;
    // }
    //
    // const originalDate = new Date(originalPayment.data_platnosci);
    // const sameDate = `${ originalDate.getFullYear().toString().padStart(4, '0') }-${ (originalDate.getMonth() + 1).toString().padStart(2, '0') }-${ originalDate.getDate().toString().padStart(2, '0') }` === formValue.dataZaplaty;
    // if (originalPayment.platnosc === parseFloat(formValue.platnosc!) &&
    //   sameDate &&
    //   originalPayment.miesiac === month &&
    //   originalPayment.rok === year &&
    //   originalPayment.opis === formValue.opis) {
    //   this.infoService.generateNotification(NotificationType.WARNING, 'Płatność nie została zmieniona.');
    //   return;
    // }
    //
    // if (isNaN(month) || isNaN(year)) {
    //   this.infoService.generateNotification(NotificationType.ERROR, 'Nieprawidłowy format miesiąca i roku.');
    //   return;
    // }
    //
    // if (month < 1 || month > 12) {
    //   this.infoService.generateNotification(NotificationType.ERROR, 'Miesiąc musi być w zakresie od 01 do 12.');
    //   return;
    // }

    // this.database.request('zsti.payment.update', { platnosc : formValue.platnosc, id : this.id, data_platnosci : formValue.dataZaplaty, miesiac : formValue.miesiac_rok?.split('-')[0], rok : formValue.miesiac_rok?.split('-')[1], opis : (formValue.opis || 'Brak Opisu') }, 'paymentList').then((payload) => {
    //   if (!payload) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować płatności.');
    //     return;
    //   }
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Płatność została zaktualizowana.');
    //   this.reloadPayments();
    //   this.closeWindow();
    // });
  }

  protected deletePayment() : void {
    // this.database.request('zsti.payment.delete', { id : this.id }, 'paymentList').then((payload) => {
    //   if (!payload) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się usunąć płatności.');
    //     return;
    //   }
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Płatność została usunięta.');
    //   this.reloadPayments();
    //   this.platnosciForm.reset({
    //     miesiac_rok : undefined,
    //     platnosc : undefined,
    //     dataZaplaty : undefined,
    //     opis : undefined
    //   });
    //   this.closeWindow();
    // });
  }

  protected addPayment() : void {
    if (this.addForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }

    const formValue = this.addForm.value;
    const monthYear = formValue.miesiac_rok?.split('-')!;
    const month = parseInt(monthYear[0], 10);
    const year = parseInt(monthYear[1], 10);

    if (isNaN(month) || isNaN(year)) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Nieprawidłowy format miesiąca i roku.');
      return;
    }

    if (month < 1 || month > 12) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Miesiąc musi być w zakresie od 01 do 12.');
      return;
    }

    // if (this.payments.some(p => p.miesiac === month && p.rok === year)) {
    //   this.infoService.generateNotification(NotificationType.ERROR, 'Płatność dla tego miesiąca i roku już istnieje.');
    //   return;
    // }
    //
    // this.database.request('zsti.payment.add', { platnosc : formValue.platnosc, data_platnosci : formValue.dataZaplaty, miesiac : formValue.miesiac_rok?.split('-')[0], rok : formValue.miesiac_rok?.split('-')[1], opis : (formValue.opis || 'Brak Opisu'), id_ucznia : this.user_id }, 'paymentList').then((payload) => {
    //   if (!payload) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać płatności.');
    //     return;
    //   }
    //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Płatność została dodana.');
    //   this.reloadPayments();
    //   this.closeWindow();
    // });
  }

  protected openWindow(type : '' | 'add' | 'delete' | 'filter') : void {
    this.showWindow = type;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.window.nativeElement, true, this.zone).then();
  }

  protected closeWindow() : void {
    this.transition.applyAnimation(this.window.nativeElement, false, this.zone).then(() => {
      this.showWindow = '';
    });
  }

  protected applyFilter() : void {
    if (this.filterForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }

    const filters = this.filterForm.value;
    // this.result = this.payments.filter(payment => {
    //   const monthYear = filters.miesiac_rok?.split('-');
    //   const month = monthYear ? parseInt(monthYear[0], 10) : null;
    //   const year = monthYear ? parseInt(monthYear[1], 10) : null;
    //
    //   return (!filters.miesiac_rok || (payment.miesiac === month && payment.rok === year)) &&
    //          (!filters.platnosc || payment.platnosc === parseFloat(filters.platnosc)) &&
    //          (!filters.dataZaplaty || payment.data_platnosci === filters.dataZaplaty) &&
    //          (!filters.opis || payment.opis.includes(filters.opis));
    // });
    // this.closeWindow();
    // if (this.result.length === 0) {
    //   this.infoService.generateNotification(NotificationType.WARNING, 'Brak wyników pasujących do filtra.');
    // } else {
    //   this.infoService.generateNotification(NotificationType.SUCCESS, `Pomyślnie zastosowano filtry. Znaleziono ${ this.result.length } ${ wynikString(this.result.length) }.`);
    // }
  }

  protected resetFilter() : void {
    this.filterForm.reset({
      miesiac_rok : undefined,
      platnosc : undefined,
      dataZaplaty : undefined,
      opis : undefined
    });
    // this.result = this.payments;
    this.infoService.generateNotification(NotificationType.INFO, 'Filtry zostały zresetowane.');

  }

  public ngOnDestroy() : void {
    // this.result = this.payments = [];
    this.destroy$.next();
    this.destroy$.complete();
  }
}
