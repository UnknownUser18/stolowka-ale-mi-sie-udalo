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
  message:string = 'brak';
  isViable:boolean = false;
  currentStudent:any = false;


  constructor(private dataService: DataBaseService) {
    this.dataService.CurrentStudentCardFromKeyCard.asObservable().subscribe((element:any) => this.handleCardResult(element))
  }

  handleCardResult(change:any)
  {
    this.value = JSON.stringify(change);
    this.currentCard = change;
    this.isViable = this.checkStudent();
  }



  checkStudent(): boolean
  {
    let value = false;
    let payments = null;
    this.message = "Nie Zapłacił"
    this.today = new Date();

    if(this.dataService.StudentType.value === "ZSTI")
    {
      this.currentStudent = this.dataService.StudentListZsti.value.find((element:any) => element.id == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia)
      if(this.dataService.PaymentZsti.value)
        payments = this.dataService.PaymentZsti.value.filter((element:any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia);
      else
        payments = {};
    }
    else
    {
      this.currentStudent = this.dataService.StudentListZsti.value.find((element:any) => element.id == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia)
      if(this.dataService.PaymentInternat.value)
        payments = this.dataService.PaymentInternat.value.filter((element:any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia);
      else
        payments = {};
    }
    if(payments.length > 0)
      if(payments.find((element:any) => element.miesiac == (this.today.getMonth() + 1) && element.rok == this.today.getFullYear()))
      {
        value = true;
        this.message = "Zapłacił"
      }
    else if((payments.miesiac == (this.today.getMonth() + 1) && payments.rok == this.today.getFullYear())) {
        value = true
        this.message = "Zapłacił"
      }
    else
      {
        if(this.today.getDate() <= 10)
          this.message = "Nie zapłacił - Data Przed 10";
      }
    console.log(payments, payments.length, this.dataService.PaymentZsti.value, this.dataService.PaymentInternat.value);
    if(payments.length > 0)
      console.log(payments.filter((element:any) => element.miesiac == (this.today.getMonth() + 1) && element.rok == this.today.getFullYear()));
    else
      console.log(payments.miesiac, this.today, payments.rok,(payments.miesiac == (this.today.getMonth() + 1) && payments.rok == this.today.getFullYear()));
    return value;
  }



}
