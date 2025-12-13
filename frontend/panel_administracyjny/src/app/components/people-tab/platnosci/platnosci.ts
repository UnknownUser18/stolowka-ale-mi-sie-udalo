import { Component, computed, DEFAULT_CURRENCY_CODE, effect, signal } from '@angular/core';
import { Persons } from "@database/persons/persons";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faFileInvoiceDollar, faFilter, faPaperPlane, faPlus, faRotate, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Payments, ZPayment } from "@database/payments/payments";
import { IsSelectedPaymentPipe } from "@pipes/isSelectedPayment/is-selected-payment.pipe";
import { Notifications } from "@services/notifications";
import { DialogTriggerDirective } from "@directives/dialog/dialog-trigger.directive";
import { ButtonDanger, ButtonDefault, ButtonPrimary, ButtonSecondary, ButtonSuccess, Dialog, Fieldset, Input, Label, Table } from '@ui';
import { Info } from "@shared/info";
import { apply, Field, form, maxLength, min, pattern, required, schema } from "@angular/forms/signals";

interface PlatnosciForm {
  miesiac_rok : string;
  platnosc : string;
  data : string;
  opis : string;
}

@Component({
  selector  : 'app-platnosci',
  imports   : [
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
    ButtonDanger,
    Field
  ],
  providers : [
    { provide : DEFAULT_CURRENCY_CODE, useValue : 'PLN' },
    DatePipe
  ],
  templateUrl : './platnosci.html',
  styleUrl  : './platnosci.scss'
})
export class Platnosci {
  protected readonly icons = {
    faPlus,
    faFilter,
    faRotate,
    faFileInvoiceDollar,
    faPaperPlane,
    faTrash
  }
  private payments = signal<ZPayment[] | null>(null);
  private platnosci = signal<PlatnosciForm>({
    miesiac_rok : '',
    platnosc    : '',
    data        : '',
    opis        : ''
  });
  private add = signal<PlatnosciForm>({
    miesiac_rok : '',
    platnosc    : '',
    data        : '',
    opis        : ''
  });
  private filter = signal<PlatnosciForm>({
    miesiac_rok : '',
    platnosc    : '',
    data        : '',
    opis        : ''
  });
  private validators = schema<PlatnosciForm>((schemaPath) => {
    pattern(schemaPath.miesiac_rok, /^(\d{4})-(0[1-9]|1[0-2])$/, { message : 'Nieprawidłowy format miesiąca i roku. Proszę wprowadzić w formacie YYYY-MM' });
    min(schemaPath.platnosc, 0, { message : 'Kwota płatności nie może być ujemna.' });
    pattern(schemaPath.data, /^\d{4}-\d{2}-\d{2}$/, { message : 'Nieprawidłowy format daty. Proszę wprowadzić w formacie YYYY-MM-DD' });
    maxLength(schemaPath.opis, 200, { message : 'Opis nie może przekraczać 200 znaków.' });
  });

  protected isLoading = false;
  protected filterForm = form(this.filter, (schemaPath) => {
    apply(schemaPath, this.validators);
  });

  protected readonly selectedPayment = signal<ZPayment | null>(null);
  protected shownPayments = computed(() => {
    if (!this.payments()) return;

    const { miesiac_rok, platnosc, data, opis } = this.filterForm().value();

    return this.payments()!.filter((payment) => {
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
  });
  private requiredValidators = schema<PlatnosciForm>((schemaPath) => {
    required(schemaPath.miesiac_rok, { message : 'Miesiąc i rok są wymagane.' });
    required(schemaPath.platnosc, { message : 'Kwota płatności jest wymagana.' });
    required(schemaPath.data, { message : 'Data płatności jest wymagana.' });
  });
  protected platnosciForm = form(this.platnosci, (schemaPath) => {
    apply(schemaPath, this.validators);
    apply(schemaPath, this.requiredValidators);
  });
  protected addForm = form(this.add, (schemaPath) => {
    apply(schemaPath, this.validators);
    apply(schemaPath, this.requiredValidators);
  });

  constructor(
    private personS : Persons,
    private paymentsS : Payments,
    private notificationsS : Notifications,
    private datePipe : DatePipe) {
    let previousPayment : ZPayment | null = null;

    effect(() => {
      this.personS.personZ();
      this.refreshPayments();
    });

    effect(() => {
      const payment = this.selectedPayment();
      if (payment?.id === previousPayment?.id) return;
      previousPayment = payment;

      this.setFormValues();
    });
  }

  private get fetchData() {
    const person = this.personS.personZ();
    if (!person) return;

    this.paymentsS.getZPayments(person.id).subscribe((payments) => {
      if (payments === null)
        this.notificationsS.createErrorNotification('Nie udało się pobrać płatności.', 10, Info.CONTACT_ADMIN);
      else if (payments.length === 0)
        this.notificationsS.createWarningNotification('Brak płatności dla tej osoby.', 5);
      else
        this.notificationsS.createSuccessNotification('Pomyślnie pobrano płatności.');

      this.isLoading = false;
      this.payments.set(payments);
    });
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

  protected updatePayment() {
    if (this.platnosciForm().invalid())
      return;

    const { miesiac_rok, platnosc, data, opis : opisForm } = this.platnosciForm().value();

    const checkedValues = this.checkIfValuesAreCorrect(miesiac_rok, platnosc, data, opisForm);
    if (!checkedValues) return;

    const { month, year, kwota, data_platnosci, opis } = checkedValues;

    const payment = this.selectedPayment()!;

    const updatedPayment : ZPayment = {
      ...payment,
      miesiac  : month,
      rok      : year,
      platnosc : kwota,
      data_platnosci,
      opis,
    };

    this.paymentsS.updateZPayment(updatedPayment).subscribe((success) => {
      if (!success) {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować płatności.', 10, Info.CONTACT_ADMIN);
        return;
      }

      this.notificationsS.createSuccessNotification('Pomyślnie zaktualizowano płatność.');
      this.selectedPayment.set(updatedPayment);
      this.refreshPayments();
    })
  }

  protected addPaymentToDB() {
    if (this.addForm().invalid())
      return;

    const person = this.personS.personZ();
    if (!person) {
      this.notificationsS.createErrorNotification('Nie można dodać płatności. Nie wybrano osoby.', 5);
      return;
    }

    const { miesiac_rok, platnosc, data, opis : opisForm } = this.addForm().value();

    const checkedValues = this.checkIfValuesAreCorrect(miesiac_rok, platnosc, data, opisForm);
    if (!checkedValues) return;

    const { month, year, kwota, data_platnosci, opis } = checkedValues;

    const newPayment : Omit<ZPayment, 'id'> = {
      id_ucznia : person.id,
      miesiac   : month,
      rok       : year,
      platnosc  : kwota,
      data_platnosci,
      opis,
    };

    this.paymentsS.addZPayment(newPayment).subscribe((insertId) => {
      if (insertId === false) {
        this.notificationsS.createErrorNotification('Nie udało się dodać płatności.', 10, Info.CONTACT_ADMIN);
        return;
      }

      this.notificationsS.createSuccessNotification('Pomyślnie dodano płatność.');
      this.addForm().reset();
      this.refreshPayments();
    })
  }

  protected deletePayment() {
    const payment = this.selectedPayment();
    if (!payment) return;

    this.paymentsS.deleteZPayment(payment.id).subscribe((success) => {
      if (!success) {
        this.notificationsS.createErrorNotification('Nie udało się usunąć płatności.', 10, Info.CONTACT_ADMIN);
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

    const { miesiac, rok, platnosc, data_platnosci, opis } = payment;

    this.platnosciForm().reset({
      miesiac_rok : this.datePipe.transform(`${ rok }-${ miesiac }`, 'yyyy-MM') || '',
      platnosc    : platnosc.toString(),
      data        : this.datePipe.transform(data_platnosci, 'yyyy-MM-dd') || '',
      opis,
    });
  }

  protected resetFilters() {
    this.filterForm().reset({
      miesiac_rok : '',
      platnosc    : '',
      data        : '',
      opis        : ''
    });
  }

  protected applyFilter() {
  }

  private checkIfValuesAreCorrect(miesiac_rok : string, platnosc : string, data : string, opis : string) {
    const monthYear = miesiac_rok.split('-');
    const month = parseInt(monthYear[1], 10);
    const year = parseInt(monthYear[0], 10);

    if (isNaN(month) || isNaN(year))
      return false;

    if (month < 1 || month > 12)
      return false;

    if (!platnosc || !data)
      return false;


    const dataPlatnosci = new Date(data);
    if (isNaN(dataPlatnosci.getTime()))
      return false;

    dataPlatnosci.setHours(0, 0, 0, 0);

    const kwota = parseFloat(platnosc);
    if (isNaN(kwota) || kwota < 0)
      return false;

    if (opis.length > 200)
      return false;

    const opisTrimmed = opis.trim();

    return { month, year, kwota, data_platnosci : dataPlatnosci, opis : opisTrimmed };
  }

  protected refreshPayments() {
    this.isLoading = true;
    this.fetchData;
  }

  private setFormValues() {
    const payment = this.selectedPayment();
    if (!payment) return;

    const { miesiac, rok, platnosc, data_platnosci, opis } = payment;

    this.platnosciForm().setControlValue({
      miesiac_rok : (this.datePipe.transform(`${ rok }-${ miesiac }`, 'yyyy-MM') || '').trim(),
      platnosc    : platnosc.toString(),
      data        : (this.datePipe.transform(data_platnosci, 'yyyy-MM-dd') || '').trim(),
      opis,
    });
  }
}
