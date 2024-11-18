import {Component, ElementRef, Input, OnChanges, Renderer2} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-platnosci',
  standalone: true,
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
  Months: string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
  PaymentZsti:any = null;
  CurrentPayment: {id:number, id_ucznia:number, platnosc:number, data_platnosci:string, miesiac:number, opis:string} = {id: -1, id_ucznia:-1, data_platnosci:'', platnosc:-1, miesiac:-1, opis:''};
  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.PaymentZsti.asObservable().subscribe(change => this.changePayments(change));
    this.dataService.CurrentStudentId.asObservable().subscribe(()=> this.changePayments(this.dataService.PaymentZsti))
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

  changePayments(changes:any)
  {
    this.PaymentZsti = []
    if(changes.value)
      changes = changes.value
    changes.forEach((element:any) => {
      console.log(element)
      if(element.id_ucznia === this.dataService.CurrentStudentId.value)
        this.PaymentZsti.push(element);
    })
    this.PaymentZsti.forEach((element:any) => {
      let date = new Date(element.data_platnosci)
      element.data_platnosci = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    })
    this.PaymentZsti.sort((a:any, b:any) => {
      let dateA:Date = new Date(a.data_platnosci);
      let dateB:Date = new Date(b.data_platnosci);

      // @ts-ignore
      return dateA - dateB;
    });
    this.showPayment()
  }

  sendPayment()
  {
    let editPayment = JSON.parse(JSON.stringify(this.CurrentPayment));
    editPayment.id_ucznia = this.dataService.CurrentStudentId.value;
    editPayment.data_platnosci = this.el.nativeElement.querySelector('input[name="payment-date-edit"]').value;
    editPayment.platnosc = this.el.nativeElement.querySelector('input[name="payment-amount-edit"]').value;
    editPayment.miesiac = this.el.nativeElement.querySelector('select[name="payment-month-edit"]').value;
    editPayment.opis = this.el.nativeElement.querySelector('input[name="payment-description-edit"]').value;
    if(editPayment.data_platnosci !== '' && editPayment.platnosc !== null && editPayment.miesiac !== 0)
    {
      this.dataService.send(JSON.stringify({
        action: "request",
          params: {
            method: "addPaymentZsti",
            studentId: editPayment.id_ucznia,
            cost: editPayment.platnosc,
            date: editPayment.data_platnosci,
            month: editPayment.miesiac,
            description: editPayment.opis
      }
      }))

      this.dataService.getPaymentZsti()
    }
    console.log(editPayment, {
      action: "request",
      params: {
        method: "addPaymentZsti",
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
    this.CurrentPayment = this.PaymentZsti[(event.target as HTMLInputElement).value]
    console.log(this.CurrentPayment)
    this.el.nativeElement.querySelector('input[name="payment-amount"]').value = this.CurrentPayment.platnosc
    this.el.nativeElement.querySelector('input[name="payment-date"]').value = this.formatDate(this.CurrentPayment.data_platnosci)
    this.el.nativeElement.querySelector('select[name="payment-month"]').value = this.CurrentPayment.miesiac - 1
    this.el.nativeElement.querySelector('input[name="payment-description"]').value = this.CurrentPayment.opis;
  }

  ngOnChanges(){
   this.showPayment()
  }

  closePlatnosc()
  {
    this.el.nativeElement.querySelector('#dodaj_platnosc').style.display = 'none';
  }

  dodajPlatnosc(){
    this.el.nativeElement.querySelector('#dodaj_platnosc').style.display = 'flex';
  }

  delete()
  {
    this.dataService.send(JSON.stringify(
      {
        action: "request",
        params: {
          method: "DeletePaymentZsti",
          id: this.CurrentPayment.id
        }
      }
    ))
    this.clearData()
    this.dataService.getPaymentZsti()
  }

  clearData()
  {
    this.el.nativeElement.querySelector('input[name="payment-amount"]').value = ''
    this.el.nativeElement.querySelector('input[name="payment-date"]').value = ''
    this.el.nativeElement.querySelector('select[name="payment-month"]').value = 0
    this.el.nativeElement.querySelector('input[name="payment-description"]').value = ''
  }
  showPayment()
  {
    console.log(this.PaymentZsti, "IOUAHSDOIUASDOUIH")
  }
}
