import {Component, Input} from '@angular/core';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-card-output',
  standalone: true,
  imports: [],
  templateUrl: './card-output.component.html',
  styleUrl: './card-output.component.css'
})
export class CardOutputComponent {
  today: Date = new Date();
  todayString: string = this.today.toString();
  currentCard:any = null;
  value:any = 'nic';

  constructor(private dataService: DataBaseService) {
    this.dataService.CurrentStudentCardFromKeyCard.asObservable().subscribe((element:any) => this.handleCardResult(element))
  }

  handleCardResult(change:any)
  {
    this.value = JSON.stringify(change);
    this.currentCard = change;
  }



  checkStudent(): boolean
  {
    let value = true;
    let payments = null;
    this.today = new Date();
    if(this.dataService.StudentType.value === "ZSTI")
      payments = this.dataService.PaymentZsti.value ? this.dataService.PaymentZsti.value.find((element:any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia) : undefined;
    else
      payments = this.dataService.PaymentInternat.value ? this.dataService.PaymentInternat.value.find((element:any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia) : undefined;
    console.log(payments);
    if(payments.length > 0)
      if(payments.find((element:any) => element.miesiac === (this.today.getMonth() + 1) && element.rok === this.today.getFullYear()))
        value = true;
      else if((payments.miesiac === (this.today.getMonth() + 1) && payments.rok === this.today.getFullYear()))
        value = true
    if (this.today.getDate() <= 10)
      value = true;
    console.log("Check Student: ", payments, this.today.getDate() <= 10 )
    console.log(payments, this.dataService.PaymentZsti.value, this.dataService.PaymentInternat.value);
    return value;
  }



}
