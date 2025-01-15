import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-card-output',
  standalone: true,
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './card-output.component.html',
  styleUrl: './card-output.component.css'
})
export class CardOutputComponent {
  @Output() reset = new EventEmitter<null>();
  today: Date = new Date();
  todayString: string = this.today.toString();
  currentCard:any = null;
  value:any = 'nic';
  message:string = 'brak';
  isViable:boolean = false;
  currentStudent:any = false;
  backgroundColor: string = 'lightgreen';  // Default to light green
  currentStudentScan:any = null;
  disabledAccept: boolean = false;
  breakfastBegin: Date;
  breakfastEnd: Date;
  lunchBegin: Date;
  lunchEnd: Date;
  dinnerBegin: Date;
  dinnerEnd: Date;
  mealArray: string[] = ['Pomiędzy Godzinami', 'Śniadnie', 'Obiad', 'Kolacja']
  mealMessage: string;
  meal: number = 0;
  constructor(private dataService: DataBaseService) {
    this.dataService.CurrentStudentCardFromKeyCard.asObservable().subscribe((element:any) => this.handleCardResult(element))
    this.today = new Date();
    this.todayString = this.today.toString();
    this.breakfastBegin = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 5, 50, 0, 0);
    this.breakfastEnd = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 8, 15, 0, 0);
    this.lunchBegin = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 12, 0, 0, 0);
    this.lunchEnd = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 17, 35, 0, 0);
    this.dinnerBegin = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 18, 0, 0, 0);
    this.dinnerEnd = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate(), 19, 30, 0, 0);
    this.mealMessage = this.mealArray[this.checkMeal(new Date())];
    if(this.checkMeal(new Date()) > 0) this.backgroundColor = 'lightgreen'
    else this.backgroundColor = 'lightcoral';
  }

  checkBreakfast(date: Date): boolean
  {
   return this.breakfastBegin < date && date < this.breakfastEnd;
  }

  checkLunch(date: Date): boolean
  {
    return this.lunchBegin < date && date < this.lunchEnd;
  }

  checkDinner(date: Date): boolean
  {
    return this.dinnerBegin < date && date < this.dinnerEnd;
  }

  checkMeal(date: Date): number
  {
    if(this.checkBreakfast(date)) return 1;
    if(this.checkLunch(date)) return 2;
    if(this.checkDinner(date)) return 3;
    return 0;
  }

  capitalizeFirstChar(str: string): string {
    if (str.length == 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  handleCardResult(change:any)
  {
    this.value = JSON.stringify(change);
    this.currentStudent = change;
    console.log(this.currentStudent);
    this.isViable = this.dataService.StudentType.value === 'ZSTI' ? this.checkStudentZsti() : this.checkStudentInternat();
  }

  initZsti()
  {
    this.message = "Nie Zapłacił"
    this.today = new Date();
    this.currentStudentScan = this.dataService.ScanZsti.value.filter((element:any) => element.id_karty == this.dataService.CurrentStudentCardFromKeyCard.value.id)
    this.currentStudent = this.dataService.StudentListZsti.value.find((element:any) => element.id == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia)
    // this.currentStudentScan = this.currentStudentScan.filter((element:any) => (new Date()).setHours(0, 0, 0, 0) <= element.czas && element.czas <= (new Date()).setHours(23, 59, 59))
  }

  initInternat()
  {
    this.message = "Nie Zapłacił"
    this.today = new Date();
    this.currentStudentScan = this.dataService.ScanInternat.value.filter((element:any) => element.id_karty == this.dataService.CurrentStudentCardFromKeyCard.value.id)
    this.currentStudent = this.dataService.StudentListInternat.value.find((element:any) => element.id == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia)
    this.currentStudentScan = this.currentStudentScan.filter((element:any) => (new Date()).setHours(0, 0, 0, 0) <= element.czas && element.czas <= (new Date()).setHours(23, 59, 59))
  }

  checkStudentInternat(): boolean {
    let value = false;
    let payments = null;
    this.initInternat()
    if (this.dataService.PaymentZsti.value)
      payments = this.dataService.PaymentInternat.value.filter((element: any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia);
    else
      payments = {};
    // if (this.checkMeal(new Date()) == 0) {
    //   this.message = "Pomiędzy Godzinami";
    //   this.value = false;
    //   this.backgroundColor = 'lightcoral'
    //   return value;
    // }

    if(payments.length > 0)
    {
      if(payments.find((element:any) => element.miesiac == (this.today.getMonth() + 1) && element.rok == this.today.getFullYear())) {
        value = this.checkInDirectInternat()
        this.message = "Zapłacił"
        this.backgroundColor = 'lightgreen'
      }
      else
      {
        this.message = "Nie Zapłacił";
        this.value = false;
        this.backgroundColor = 'lightcoral'
      }
    }
    else
    {
      this.message = "Nie Zapłacił";
      this.value = false;
      this.backgroundColor = 'lightcoral'
    }
    return value
  }

  checkInDirectInternat(): boolean{
    let localValue = false;
    console.log(this.checkMeal(new Date()), 'test')
    switch (this.checkMeal(new Date()))
    {
      case 0:
        this.message = "Pomiędzy Godzinami";
        localValue = false;
        break;
      case 1:
        this.message = "Śniadanie";
        localValue = true;

        break;
      case 2:
        this.message = "Obiad";
        localValue = true;
        break;
      case 3:
        this.message = "Kolacja";
        localValue = true;
        break;
    }
    return localValue;
  }

  checkStudentZsti(): boolean
  {
    let value = false;
    let payments = null;
    this.message = "Nie Zapłacił"
    this.initZsti()
    if(this.dataService.PaymentZsti.value)
      payments = this.dataService.PaymentZsti.value.filter((element:any) => element.id_ucznia == this.dataService.CurrentStudentCardFromKeyCard.value.id_ucznia);
    else
      payments = {};
    if(this.today.getDate() <= 10)
    {
      this.message = "Nie zapłacił - Data Przed 10";
      this.value = false;
      this.backgroundColor = 'lightblue'
    }
    if(payments.length > 0)
      if(payments.find((element:any) => element.miesiac == (this.today.getMonth() + 1) && element.rok == this.today.getFullYear()))
      {
        value = true;
        this.message = "Zapłacił"
        this.backgroundColor = 'lightgreen'
      }

    console.log(this.currentStudentScan)
    this.currentStudentScan.filter((element:any) => new Date(element.czas).getMonth() == new Date().getMonth()).forEach((element:any) =>{
      let curData = new Date(element.czas);
      let today = new Date();
      console.log("Porównanie dat: ", curData, today)
      if(curData.getFullYear() == today.getFullYear() && curData.getMonth() == today.getMonth() && curData.getDate() == today.getDate())
      {
        value = false;
        this.message = "Karta Została Dzisiaj Zeskanowanoa"
        this.disabledAccept = true;
        this.backgroundColor = 'lightcoral'
      }
    })
    this.dataService.getScanZsti();
    return value;
  }


  onAccept() {
    this.backgroundColor = 'lightgreen';  // Dim green
    let data = new Date();
    let method = this.dataService.StudentType.value == "ZSTI" ? "addScanZsti" : "addScanInternat";
    console.warn(this.currentStudent)
    this.dataService.send(JSON.stringify(
      {
        action: "request",
        params: {
          method: method,
          cardId: this.currentStudent.id,
          datetime: `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`,
          meal: this.meal
        }
      }
    ))
    this.onReset()
  }

  onReject() {
    this.backgroundColor = 'lightcoral';  // Dim red
    this.onReset()
  }

  onMoreInfo() {
    // You can add logic for more info if needed
    alert('More information');
  }

  onReset(){
    this.dataService.getScanZsti()
    this.disabledAccept = false;
    this.reset.emit();
  }

}
