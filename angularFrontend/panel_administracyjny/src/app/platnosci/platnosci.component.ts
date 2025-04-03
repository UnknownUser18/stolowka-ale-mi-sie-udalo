import {Component, ElementRef, Input, OnChanges} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import { Payments} from '../app.component';

@Component({
    selector: 'app-platnosci',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgForOf,
        NgOptimizedImage
    ],
    templateUrl: './platnosci.component.html',
    styleUrl: './platnosci.component.css'
})
export class PlatnosciComponent implements OnChanges{
  @Input() typ: string | undefined;
  DOMelement : any | undefined;
  Months: string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
  PaymentZsti:any = null;
  PaymentInternat:any = null;
  CurrentPayment: {id:number, id_ucznia:number, platnosc:number, data_platnosci:string, miesiac:number, opis:string} = {id: -1, id_ucznia:-1, data_platnosci:'', platnosc:-1, miesiac:-1, opis:''};
  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.PaymentZsti.asObservable().subscribe(change => this.changePayments(change));
    this.dataService.CurrentStudentId.asObservable().subscribe(()=> this.typeChangePayment())
    this.dataService.PaymentInternat.asObservable().subscribe(change=> this.changePayments(change))
    this.dataService.StudentType.asObservable().subscribe(()=> this.typeChangePayment())
    this.DOMelement = this.el.nativeElement;
  }

  monthToString(month:number, isNormal:boolean)
  {
    if(isNormal)
      month--;
    return this.Months[month]
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    console.log(dateStr.split('-'))
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  }

  typeChangePayment()
  {
    if(this.dataService.StudentType.value === 'ZSTI')
    {
      this.changePayments(this.dataService.PaymentZsti.value);
    }
    else if (this.dataService.StudentType.value === 'Internat')
    {
      this.changePayments(this.dataService.PaymentInternat.value);
    }
  }

  changePayments(changes:Payments[])
  {
    if(this.DOMelement === undefined) return;
    this.clearData()
    this.selectedPayment = null;
    this.PaymentZsti = []
    // if(changes.value)
    //   changes = changes.value
    changes.forEach((element:Payments) => {
      if(element.id_ucznia === this.dataService.CurrentStudentId.value && element.id_ucznia !== null)
        this.PaymentZsti.push(element);
    })
    this.PaymentZsti.forEach((element:Payments) => {
      let date = new Date(element.data_platnosci)
      element.data_platnosci = this.formatDate(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
    })
    this.PaymentZsti.sort((a:any, b:any) => {
      let dateA:Date = new Date(this.formatDate(a.data_platnosci));
      let dateB:Date = new Date(this.formatDate(b.data_platnosci));

      // @ts-ignore
      return dateA - dateB;
    });
    this.PaymentZsti.reverse();
    this.selectedPayment = -1;
    this.showPayment()
  }

  sendPayment()
  {
    let method = 'addPaymentZsti';
    if(this.dataService.StudentType.value === 'Internat')
      method = 'addPaymentInternat';
    let editPayment = JSON.parse(JSON.stringify(this.CurrentPayment));
    editPayment.id_ucznia = this.dataService.CurrentStudentId.value;
    editPayment.data_platnosci = this.DOMelement.querySelector('input[name="payment-date-edit"]').value;
    editPayment.platnosc = this.DOMelement.querySelector('input[name="payment-amount-edit"]').value;
    editPayment.miesiac = this.DOMelement.querySelector('select[name="payment-month-edit"]').value ;
    editPayment.opis = this.DOMelement.querySelector('input[name="payment-description-edit"]').value;
    if(editPayment.data_platnosci !== '' && editPayment.platnosc !== null && editPayment.miesiac !== 0)
    {
      this.dataService.send(JSON.stringify({
        action: "request",
          params: {
            method: method,
            studentId: editPayment.id_ucznia,
            cost: editPayment.platnosc,
            date: editPayment.data_platnosci,
            month: editPayment.miesiac,
            description: editPayment.opis
      }
      }))
      if(this.dataService.StudentType.value === 'ZSTI')
        this.dataService.getPaymentZsti()
      else
        this.dataService.getPaymentInternat()
    }
    console.log(editPayment, {
      action: "request",
      params: {
        method: method,
        studentId: editPayment.id_ucznia,
        cost: editPayment.platnosc,
        date: editPayment.data_platnosci,
        month: editPayment.miesiac,
        description: editPayment.opis
      }
    })
    this.closePlatnosc()
  }

  updatePayment(event: Event)
  {
    console.log(event);
    if((event.target as HTMLInputElement).type === 'radio')
      this.CurrentPayment = this.PaymentZsti[(event.target as HTMLInputElement).value]
    else
      this.CurrentPayment = this.PaymentZsti[((event.target as HTMLElement).querySelector('input[name="Payment"]') as HTMLInputElement).value]
    console.log(this.CurrentPayment)
    this.DOMelement.querySelector('input[name="payment-amount"]').value = this.CurrentPayment.platnosc
    this.DOMelement.querySelector('input[name="payment-date"]').value = this.formatDate(this.CurrentPayment.data_platnosci)
    this.DOMelement.querySelector('select[name="payment-month"]').value = this.CurrentPayment.miesiac - 1
    this.DOMelement.querySelector('input[name="payment-description"]').value = this.CurrentPayment.opis;
  }

  selectedPayment: number | null = -1;
  ngOnChanges(){
   this.showPayment()
  }

  closePlatnosc()
  {
    this.DOMelement.querySelector('#dodaj_platnosc').style.display = 'none';
  }

  dodajPlatnosc(){
    this.DOMelement.querySelector('#dodaj_platnosc').style.display = 'flex';
    this.DOMelement.querySelector('input[name="payment-date-edit"]').value = this.dataService.formatDate(new Date())
  }

  delete()
  {
    let method = 'DeletePaymentZsti';
    if(this.dataService.StudentType.value === 'Internat')
      method = 'DeletePaymentInternat';
    this.dataService.send(JSON.stringify(
      {
        action: "request",
        params: {
          method: method,
          id: this.CurrentPayment.id
        }
      }
    ))
    this.clearData()
    if(this.dataService.StudentType.value === 'ZSTI')
      this.dataService.getPaymentZsti()
    else
      this.dataService.getPaymentInternat()
  }

  clearData()
  {
    this.DOMelement.querySelector('input[name="payment-amount"]').value = ''
    this.DOMelement.querySelector('input[name="payment-date"]').value = ''
    this.DOMelement.querySelector('select[name="payment-month"]').value = 0
    this.DOMelement.querySelector('input[name="payment-description"]').value = ''
  }
  showPayment()
  {
    // console.log(this.PaymentZsti)
  }
}
