import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {toBinary, daneOsobowe} from '../app.component';
import {NgIf, NgStyle} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AutoCompleteComponent} from '../auto-complete/auto-complete.component';

@Component({
  selector: 'app-card-output',
  imports: [
    NgIf,
    NgStyle,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteComponent
  ],
  templateUrl: './card-output.component.html',
  standalone: true,
  styleUrl: './card-output.component.css'
})
export class CardOutputComponent {
  @Output() emitReset = new EventEmitter();
  @ViewChild('cardInput') cardInput: any;
  @ViewChild('cardInput2') cardInput2: any;
  currentInfo: any;
  today: Date = new Date();
  daneUcznia: daneOsobowe = new daneOsobowe('', '');
  canAccept: boolean = false;
  studentScans: any;
  backgroundColor = '#2E3B4E';
  cardTextInput: string = '';
  message: string = '';
  constructor(protected dataService: DataBaseService) {
    this.dataService.keycardInput.asObservable().subscribe((value) => this.findStudent(value))
    console.log("Today: ", this.today, this.today.getDay())
    // this.today.setUTCHours(12, 45, 30, 0);
  }

  findStudent(keycardInput: any)
  {
    if(this.dataService.ScanningInfoZsti.value == undefined) return;
    console.log("Key Card Input Value: ", keycardInput)
    console.log(`this.dataService.ScanningInfoZsti.value: `, this.dataService.ScanningInfoZsti.value);
    if(this.dataService.ScanningInfoZsti.value.find((distinctStudnet:any) => distinctStudnet.key_card == keycardInput))
    {
      this.dataService.StudentType.next("ZSTI");
      this.dataService.CurrentStudent.next(this.dataService.ScanningInfoZsti.value.find((distinctStudnet:any) => distinctStudnet.key_card == keycardInput));
      this.currentInfo = this.dataService.CurrentStudent.value;
      this.daneUcznia.setAttributes(this.currentInfo.imie, this.currentInfo.nazwisko, true)
      this.dataService.CurrentStudentDeclaration.next(this.dataService.StudentDeclarationZsti.value.find((element:any) => element.id_osoby == this.dataService.CurrentStudent.value.id && new Date(element.data_od) <= new Date() && new Date() <= new Date(element.data_do)))
      this.handleStudentZsti(this.dataService.CurrentStudent.value);
    }
    else{
      this.dataService.StudentType.next("null");
      this.daneUcznia.setAttributes('', '', false)
      this.dataService.CurrentStudent.next(null);
      this.currentInfo = 'Proszę spróbować jeszcze raz!';
      this.handleNoStudentFound();
    }
  }

  handleStudentZsti(student: any)
  {
    this.onBlur()
    this.dataService.getScanZsti()
    this.canAccept = false;
    this.backgroundColor = '#f5a1a1'
    // Sprawdzenie czy dzisiaj nie jest przypadkiem sobota albo poniedzialek
    if(this.today.getDay() == 0 || this.today.getDay() == 6)
    {
      this.message = "Weekend"
      console.warn('Today\'s day of the week is either Sunday Or Saturday');
      return;
    }
    console.log(this.dataService.CurrentStudentDeclaration.value)

    // Czy dni w deklaracji istnieja
    if(this.dataService.CurrentStudentDeclaration.value == undefined)
    {
      this.message = "Brak deklaracji ucznia"
      console.warn('Enabled days of stolowka are not found')
      return;
    }

    // Czy wedlug dni dzisiaj chodzę
    if(toBinary(this.dataService.CurrentStudentDeclaration.value.dni.data, 5)[this.today.getDay() - 1] != '1')
    {
      this.message = "Uczeń nie może dzisiaj iść na stołówkę z swoją deklaracją"
      console.warn('Not possible to go to stolowka that day')
    }
    if(!this.isObiad(this.today))
    {
      console.warn('It isn\'t time for lunch');
      this.message = "Pomiędzy Godzinami - Nie ma teraz obiadu"
      return;
    }
    this.getStudentScans()
    console.log(this.studentScans, this.today)
    let foundData = this.studentScans.find((distinctScan: any) => distinctScan.czas.getFullYear() == this.today.getFullYear() && distinctScan.czas.getMonth() == this.today.getMonth() && distinctScan.czas.getDate() == this.today.getDate())
    if(foundData)
    {
      this.studentScans.forEach((distinctScan: any) => console.log(distinctScan.czas, distinctScan.czas.getFullYear() == this.today.getFullYear() && distinctScan.czas.getMonth() == this.today.getMonth() && distinctScan.czas.getDate() == this.today.getDate()))
      console.warn('Todays lunch has been retrieved');
      this.message = `Dziś już wydano posiłek: ${foundData.czas.getHours()}:${this.dataService.toLength(foundData.czas.getMinutes().toString(), 2, '0')}`
      return;
    }

    this.dataService.StudentZstiDays.next(this.dataService.DisabledZstiDays.value.filter((distinctDay: any) => distinctDay.osoby_zsti_id == this.dataService.CurrentStudent.value.id))
    this.dataService.StudentZstiDays.value.forEach((distinctDay: any) => {
      distinctDay.dzien_wypisania = new Date(distinctDay.dzien_wypisania)
    })
    console.warn(this.dataService.StudentZstiDays.value)

    if(this.dataService.StudentZstiDays.value.find((distinctDay: any) => distinctDay.dzien_wypisania.getFullYear() == this.today.getFullYear() && distinctDay.dzien_wypisania.getMonth() == this.today.getMonth() && distinctDay.dzien_wypisania.getDate() == this.today.getDate()))
    {
      this.message = "Uczeń zrezygnował wcześniej z posiłku";
      console.warn('Student refused the lunch earlier')
      return;
    }


    // Sprawdzenie czy zapłacił w tym miesiącu
    if(this.dataService.CurrentStudent.value.miasto)
      this.message = "Uczeń zapłacił";
    else if(!this.checkPayments(this.dataService.PaymentZsti.value, this.dataService.CurrentStudent.value))
    {
      if(this.today.getDate() > 10)
      {
        this.message = "Uczeń nie zapłacił"
        console.warn('not passed payments');
        return;
      }
      this.message = "Uczeń nie zapłacił - data przed dziesiątym"
      console.warn('not passed payments but date is below or equal 10th day');
    }



    this.message = `Uczeń może wejść na stołówkę - ${new Date().getHours()}:${new Date().getMinutes()}`
    this.backgroundColor = '#a8e5a1'
    this.canAccept = true;
    setTimeout(() => this.handleSubmitZsti(), 100)
    console.log('passed payments')
    console.log(this.message);
  }

  getStudentScans()
  {
    if(this.dataService.StudentType.value == 'ZSTI')
    {
      this.studentScans = this.dataService.ScanZsti.value.filter((distinctScan: any) => distinctScan.id_karty == this.dataService.CurrentStudent.value.id_karty);
    }
    else if(this.dataService.StudentType.value == 'Internat')
    {
      this.studentScans = []
    }
    else{
      this.studentScans = []
    }
    this.studentScans.forEach((distinctScan: any) => distinctScan.czas = new Date(distinctScan.czas))
    return [];
  }

  checkPayments(paymentList: any, student: any) : boolean
  {
    let payments = paymentList.filter((distinctPayment: any) => distinctPayment.id_ucznia == student.id);
    console.log(payments, student);
    if(payments.length == 0) return false;
    if(payments.find((distinctPayment: any) => distinctPayment.miesiac == (this.today.getMonth() + 1) && distinctPayment.rok == this.today.getFullYear())) return true;
    return false;
  }

  isObiad(dataDoSprawdzenia: Date) : boolean
  {
    let obiadStart = new Date(), obiadEnd = new Date();
    obiadStart.setHours(11, 0, 0, 0);
    obiadEnd.setHours(18, 30, 0, 0);
    console.warn(obiadStart, obiadStart <= dataDoSprawdzenia && dataDoSprawdzenia <= obiadEnd, obiadEnd, dataDoSprawdzenia);
    return obiadStart <= dataDoSprawdzenia && dataDoSprawdzenia <= obiadEnd;
  }
  handleNoStudentFound()
  {
    setTimeout(() => this.cardInput2.nativeElement.focus(), 200)
    console.warn('Nie znaleziono');
  }
  handleReset() {
    this.dataService.CurrentStudent.next(null);
    this.dataService.StudentType.next('');
    this.dataService.CurrentStudentDeclaration.next(null);
    this.dataService.getScanZsti()
    this.canAccept = false;
    console.log(this.message);
    this.message = '';
    this.emitReset.emit();
  }

  handleSubmitZsti(){
    let tempData = new Date();
    let dataString = `${tempData.getFullYear()}-${tempData.getMonth() + 1}-${tempData.getDate()} ${tempData.getHours()}:${tempData.getMinutes()}:${tempData.getSeconds()}`
    let sendingData = JSON.stringify({
      action: 'request',
      params: {
        method: 'addScanZsti',
        cardId: this.dataService.CurrentStudent.value.id_karty,
        datetime: dataString,
      },
    })
    // let sendUse = JSON.stringify({
    //   action: 'request',
    //   params: {
    //     method: 'addScanZsti',
    //   }
    // })
    console.warn(sendingData);
    this.dataService.send(sendingData);
    this.dataService.send(JSON.stringify({
      action: 'request',
      params: {
        method: 'changeLastUseOfCardZsti',
        cardId: this.dataService.CurrentStudent.value.id_karty,
        datetime: dataString
      }
    }))
    this.dataService.getScanZsti()
    // this.handleReset()
  }

  onBlur()
  {
    setTimeout(() => this.focusInput(), 100)
  }

  focusInput() {
    if(this.daneUcznia.znaleziony)
    this.cardInput.nativeElement.focus();
    else
      this.cardInput2.nativeElement.focus();
  }

  handleFormSubmit(inputEvent: number)
  {
    console.warn(inputEvent.toString())
    this.dataService.keycardInput.next(inputEvent.toString());
  }

  protected readonly JSON = JSON;
}
