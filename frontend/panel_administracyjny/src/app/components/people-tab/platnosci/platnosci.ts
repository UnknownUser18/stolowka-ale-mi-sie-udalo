import { Component, DEFAULT_CURRENCY_CODE, effect, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Persons } from "@database/persons/persons";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faFileInvoiceDollar, faFilter, faPaperPlane, faPlus, faRotate, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Payments, ZPayment } from "@database/payments/payments";
import { IsSelectedPaymentPipe } from "@pipes/isSelectedPayment/is-selected-payment.pipe";
import { Notifications } from "@services/notifications";
import { DialogTriggerDirective } from "@directives/dialog/dialog-trigger.directive";
import { ButtonDanger, ButtonDefault, ButtonPrimary, ButtonSecondary, ButtonSuccess, Dialog, Fieldset, Input, Label, Table } from '@ui';

@Component({
  selector  : 'app-platnosci',
  imports   : [
    ReactiveFormsModule,
    DatePipe,
    FaIconComponent,
    IsSelectedPaymentPipe,
    CurrencyPipe,
    Dialog,
    DialogTriggerDirective,
    ButtonPrimary,
    ButtonSecondary,
    ButtonDefault,
    Table,
    Fieldset,
    Label,
    Input,
    ButtonSuccess,
    ButtonDanger
  ],
  providers : [
    { provide : DEFAULT_CURRENCY_CODE, useValue : 'PLN' },
    DatePipe
  ],
  templateUrl : './platnosci.html',
  styleUrl  : './platnosci.scss'
})
export class Platnosci {
  private payments : ZPayment[] | null = null;

  protected isLoading = false;
  protected shownPayments : ZPayment[] | null = null;

  protected readonly miesiac_rok_pattern = '^(\\d{4})-(0[1-9]|1[0-2])$';
  protected readonly data_pattern = '^\\d{4}-\\d{2}-\\d{2}$';
  protected readonly platnosc_pattern = '^\\d+(\\.\\d{1,2})?$';

  protected readonly selectedPayment = signal<ZPayment | null>(null);

  protected platnosciForm = new FormGroup({
    miesiac_rok : new FormControl('', [Validators.required, Validators.pattern(this.miesiac_rok_pattern)]),
    platnosc : new FormControl('', [Validators.required, Validators.min(0), Validators.pattern(this.platnosc_pattern)]),
    data     : new FormControl('', [Validators.required, Validators.pattern(this.data_pattern)]),
    opis     : new FormControl('', [Validators.maxLength(200)])
  });

  protected addForm = new FormGroup({
    miesiac_rok : new FormControl('', [Validators.required, Validators.pattern(this.miesiac_rok_pattern)]),
    platnosc : new FormControl('', [Validators.required, Validators.min(0), Validators.pattern(this.platnosc_pattern)]),
    data     : new FormControl('', [Validators.required, Validators.pattern(this.data_pattern)]),
    opis     : new FormControl('', [Validators.maxLength(200)])
  });

  protected filterForm = new FormGroup({
    miesiac_rok : new FormControl('', [Validators.pattern(this.miesiac_rok_pattern)]),
    platnosc : new FormControl('', [Validators.min(0), Validators.pattern(this.platnosc_pattern)]),
    data     : new FormControl('', [Validators.pattern(this.data_pattern)]),
    opis     : new FormControl('', [Validators.maxLength(200)])
  });

  protected readonly faPlus = faPlus;
  protected readonly faFilter = faFilter;
  protected readonly faRotate = faRotate;
  protected readonly faFileInvoiceDollar = faFileInvoiceDollar;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faTrash = faTrash;


  constructor(
    private personS : Persons,
    private paymentsS : Payments,
    private notificationsS : Notifications,
    private datePipe : DatePipe) {
    effect(() => {
      this.personS.personZ();
      this.refreshPayments();
    });

    effect(() => {
      this.selectedPayment();
      this.setFormValues();
    });
  }

  private checkIfValuesAreCorrect(miesiac_rok : string, platnosc : string, data : string, opis : string) {
    const monthYear = miesiac_rok?.split('-');

    if (!monthYear) {
      this.notificationsS.createErrorNotification('Nieprawidłowy format miesiąca i roku.', 5);
      return false;
    }

    const month = parseInt(monthYear[1], 10);
    const year = parseInt(monthYear[0], 10);

    if (isNaN(month) || isNaN(year)) {
      this.notificationsS.createErrorNotification('Nieprawidłowy format miesiąca i roku.', 5);
      return false;
    }

    if (month < 1 || month > 12) {
      this.notificationsS.createErrorNotification('Miesiąc musi być w zakresie od 01 do 12.', 5);
      return false;
    }

    if (!platnosc) {
      this.notificationsS.createErrorNotification('Kwota płatności jest wymagana.', 5);
      return false;
    }

    if (!data) {
      this.notificationsS.createErrorNotification('Data płatności jest wymagana.', 5);
      return false;
    }

    const dataPlatnosci = new Date(data);
    if (isNaN(dataPlatnosci.getTime())) {
      this.notificationsS.createErrorNotification('Nieprawidłowa data płatności.', 5);
      return false;
    }

    dataPlatnosci.setHours(0, 0, 0, 0);

    const kwota = parseFloat(platnosc);
    if (isNaN(kwota) || kwota < 0) {
      this.notificationsS.createErrorNotification('Nieprawidłowa kwota płatności.', 5);
      return false;
    }

    if (opis && opis.length > 200) {
      this.notificationsS.createErrorNotification('Opis nie może przekraczać 200 znaków.', 5);
      return false;
    }

    const opisTrimmed = opis ? opis.trim() : '';

    return { month, year, kwota, data_platnosci : dataPlatnosci, opis : opisTrimmed };
  }

  protected formatDate(date : string) : string {
    if (/^\d{2}-\d{4}$/.test(date)) {
      const [month, year] = date.split('-');
      return `${ new Date(Number(year), Number(month) - 1).toLocaleString('pl-PL', { month : 'long' }) } ${ year }`;
    }

    return new Date(date).toLocaleDateString('pl-PL', {
      year : 'numeric',
      month : 'long',
      day  : 'numeric'
    });
  }

  private get fetchData() {
    const person = this.personS.personZ();
    if (!person) return;

    this.paymentsS.getZPayments(person.id).subscribe((payments) => {
      if (payments === null)
        this.notificationsS.createErrorNotification('Nie udało się pobrać płatności.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      else if (payments.length === 0)
        this.notificationsS.createWarningNotification('Brak płatności dla tej osoby.', 5);
      else
        this.notificationsS.createSuccessNotification('Pomyślnie pobrano płatności.');

      this.isLoading = false;
      this.shownPayments = this.payments = payments;
    });
  }

  protected updatePayment() {

    if (this.platnosciForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy.', 5);
      return;
    }

    const { miesiac_rok, platnosc, data, opis : opisForm } = this.platnosciForm.value;

    const checkedValues = this.checkIfValuesAreCorrect(miesiac_rok!, platnosc!, data!, opisForm!);
    if (!checkedValues) return;

    const { month, year, kwota, data_platnosci, opis } = checkedValues;


    const payment = this.selectedPayment()!;

    const updatedPayment : ZPayment = {
      ...payment,
      miesiac  : month,
      rok      : year,
      platnosc : kwota,
      data_platnosci : data_platnosci,
      opis     : opis,
    };

    this.paymentsS.updateZPayment(updatedPayment).subscribe((success) => {
      if (!success) {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować płatności.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        return;
      }

      this.notificationsS.createSuccessNotification('Pomyślnie zaktualizowano płatność.');
      this.selectedPayment.set(updatedPayment);
      this.refreshPayments();
    })
  }

  protected addPaymentToDB() {
    if (this.addForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy.', 5);
      return;
    }

    const person = this.personS.personZ();
    if (!person) {
      this.notificationsS.createErrorNotification('Nie można dodać płatności. Nie wybrano osoby.', 5);
      return;
    }

    const { miesiac_rok, platnosc, data, opis : opisForm } = this.addForm.value;

    const checkedValues = this.checkIfValuesAreCorrect(miesiac_rok!, platnosc!, data!, opisForm!);
    if (!checkedValues) return;

    const { month, year, kwota, data_platnosci, opis } = checkedValues;

    const newPayment : Omit<ZPayment, 'id'> = {
      id_ucznia : person.id,
      miesiac   : month,
      rok       : year,
      platnosc  : kwota,
      data_platnosci : data_platnosci,
      opis      : opis,
    };

    this.paymentsS.addZPayment(newPayment).subscribe((insertId) => {
      if (insertId === false) {
        this.notificationsS.createErrorNotification('Nie udało się dodać płatności.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        return;
      }

      this.notificationsS.createSuccessNotification('Pomyślnie dodano płatność.');
      this.addForm.reset();
      this.refreshPayments();
    })
  }

  protected deletePayment() {
    const payment = this.selectedPayment();
    if (!payment) return;

    this.paymentsS.deleteZPayment(payment.id).subscribe((success) => {
      if (!success) {
        this.notificationsS.createErrorNotification('Nie udało się usunąć płatności.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        return;
      }

      this.notificationsS.createSuccessNotification('Pomyślnie usunięto płatność.');
      this.selectedPayment.set(null);
      this.refreshPayments();
    })
  }

  protected resetPayment() {
    const payment = this.selectedPayment();

    if (!payment) return;

    this.platnosciForm.reset({
      miesiac_rok : this.datePipe.transform(`${ payment.rok }-${ payment.miesiac }`, 'yyyy-MM'),
      platnosc : payment.platnosc.toString(),
      data     : this.datePipe.transform(payment.data_platnosci, 'yyyy-MM-dd'),
      opis     : payment.opis,
    });
  }

  protected applyFilter() {
    if (!this.payments) return;

    const { miesiac_rok, platnosc, data, opis } = this.filterForm.value;

    this.shownPayments = this.payments.filter((payment) => {
      let matches = true;

      if (miesiac_rok) {
        const [year, month] = miesiac_rok.split('-').map(Number);
        matches = matches && payment.rok === year && payment.miesiac === month;
      }

      if (platnosc) {
        const kwota = parseFloat(platnosc);
        matches = matches && payment.platnosc === kwota;
      }

      if (data) {
        const dataPlatnosci = new Date(data);
        dataPlatnosci.setHours(0, 0, 0, 0);
        const paymentDate = new Date(payment.data_platnosci);
        paymentDate.setHours(0, 0, 0, 0);
        matches = matches && paymentDate.getTime() === dataPlatnosci.getTime();
      }

      if (opis) {
        matches = matches && payment.opis.toLowerCase().includes(opis.toLowerCase());
      }

      return matches;
    });
  }

  protected resetFilters() {
    this.filterForm.reset();
    this.shownPayments = this.payments;
  }

  protected refreshPayments() {
    this.isLoading = true;
    this.fetchData;
  }

  private setFormValues() {
    const payment = this.selectedPayment();
    if (!payment) return;


    this.platnosciForm.patchValue({
      miesiac_rok : this.datePipe.transform(payment.rok + '-' + payment.miesiac, 'yyyy-MM'),
      platnosc : payment.platnosc.toString(),
      data     : this.datePipe.transform(payment.data_platnosci, 'yyyy-MM-dd'),
      opis     : payment.opis,
    });
  }
}
