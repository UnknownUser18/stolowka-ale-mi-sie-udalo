// (global as any).WebSocket = require('ws');
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  socket: WebSocket | undefined;
  StudentDeclarationZsti = new BehaviorSubject<any>(null);
  CurrentStudentDeclaration = new BehaviorSubject<any>(null);
  StudentDeclarationInternat = new BehaviorSubject<any>(null);
  StudentListZsti = new BehaviorSubject<any>(null);
  StudentListZstiData = this.StudentListZsti.asObservable();
  CurrentZstiDays = new BehaviorSubject<any>(null);
  StudentListInternat = new BehaviorSubject<any>(null);
  StudentListInternatData = this.StudentListInternat.asObservable();
  CurrentInternatDays = new BehaviorSubject<any>(null);
  StudentZstiDays = new BehaviorSubject<any>(null);
  StudentInternatDays = new BehaviorSubject<any>(null);
  CurrentStudentId = new BehaviorSubject<number>(-1)
  StudentType = new BehaviorSubject<string>("BRAK")
  lastValue:any = null;
  CurrentDisabledInternatDays = new BehaviorSubject<any>(null);
  StudentDisabledZstiDays = new BehaviorSubject<any>(null);
  StudentDisabledInternatDays = new BehaviorSubject<any>(null);
  CurrentDisabledZstiDays = new BehaviorSubject<any>(null);
  DisabledDays = new BehaviorSubject<any>(null);
  TypPosilkuSaved = new BehaviorSubject<boolean>(true)
  SelectedSaved = new BehaviorSubject<boolean>(true)
  PersonalDataSaved = new BehaviorSubject<boolean>(true)
  DeclarationDataSaved = new BehaviorSubject<boolean>(true)
  SchoolYears = new BehaviorSubject<any>(null)
  LastStudentInsertId = new BehaviorSubject<any>(null)
  PaymentZsti = new BehaviorSubject<any>(null)
  CardsZsti = new BehaviorSubject<any>(null)
  CurrentStudentCardZsti = new BehaviorSubject<any>(null)
  SavedList: any[] = [
    this.TypPosilkuSaved,
    this.SelectedSaved,
    this.PersonalDataSaved,
    this.DeclarationDataSaved
  ];
  initWebSocket()
  {
    this.socket = new WebSocket("ws://localhost:8080");
    // @ts-ignore
    this.socket.onopen = (event: Event) => {
      console.log('WebSocket connection established')
      this.Initialize()
    }
    this.socket.onerror = (event: Event) => {
      console.log('WebSocket connection error')
      setTimeout(()=>{
        this.initWebSocket()
      },1000)
    }
  }
  constructor() {
    setTimeout(()=>{
      this.initWebSocket()
    },500)

  }

  public changeSelectedSaved(change:boolean)
  {
    this.SelectedSaved.next(change)
  }

  public changeTypPoslikuSaved(change:boolean)
  {
    this.TypPosilkuSaved.next(change);
  }

  public changePersonalDataSaved(change:boolean)
  {
    this.PersonalDataSaved.next(change);
  }

  public changeDeclarationDataSaved(change:boolean)
  {
    this.DeclarationDataSaved.next(change);
  }
  getDisabledDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getDniNieczynne"}}));
  }
  getPaymentZsti()
  {
    this.send(JSON.stringify({action: "request", params: {method: 'getPaymentZsti'}}))
  }
  getStudentInternatDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentInternatDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDisabledInternatDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDisabledInternatDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentZstiDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentZstiDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDisabledZstiDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDisabledZstiDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDeclarationZsti()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDeclarationZsti"}}));
  }
  getStudentDeclarationInternat()
  {
    this.send( JSON.stringify({action: "request", params: {method: "getStudentDeclarationInternat"}}));
  }

  getStudentList()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentListInternat"}}))
    this.send(JSON.stringify({action: "request", params: {method: "getStudentListZsti"}}))
  }

  getSchoolYears()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getSchoolYears"}}));
  }

  getCardsZsti()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getKartyZsti"}}))
  }

  changeStudent(Id:number, type:string):void {
    this.CurrentStudentId.next(Id)
    this.StudentType.next(type)

    console.log(Id, type)
    if (this.StudentType.value === "ZSTI") {
      this.getStudentDeclarationZsti()
      console.log(this.StudentDeclarationInternat.value, "NMIGER")
      console.log(this.CurrentStudentDeclaration, this.CurrentStudentId)
      this.getStudentZstiDays()
      this.getStudentDisabledZstiDays()
    }
    else{
      this.getStudentDeclarationInternat()
      console.log(this.StudentDeclarationInternat.value, "NMIGER")
      console.log(this.CurrentStudentDeclaration, this.CurrentStudentId)
      this.getStudentInternatDays()
      this.getStudentDisabledInternatDays()
    }
    console.log("CURRENT STUDENT DECLARATION: ", this.CurrentStudentDeclaration)
    this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
    console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
  }

  send(query:string)
  {
    // @ts-ignore
    if(this.socket !== undefined) this.socket.send(query);
  }

  Initialize() {
      this.socket!.addEventListener('message', (event) => {
        // console.log('Message incoming from the server: ', event.data);
        if (event.data === "Succesfully connected to the server")
        {
          return
        }
        let tempArray:any[] = []
        this.lastValue = JSON.parse(event.data);
        switch (this.lastValue.params.variable) {
          case 'StudentDeclarationZsti':
            this.StudentDeclarationZsti.next(this.lastValue.params.value );
            this.CurrentStudentDeclaration.next(this.StudentDeclarationZsti.value.find((element:any)=> element.id_osoby == this.CurrentStudentId.value && new Date(element.data_od) <= new Date() && new Date() <= new Date(element.data_do)))
            console.log("StudentDeclarationZsti: ", this.lastValue.params.value);
            break;
          case 'StudentDeclarationInternat':
            this.StudentDeclarationInternat.next(this.lastValue.params.value );
            this.CurrentStudentDeclaration.next(this.StudentDeclarationInternat.value.find((element:any)=> element.osoby_internat_id == this.CurrentStudentId.value && new Date(element.data_od) <= new Date() && new Date() <= new Date(element.data_do)))
            console.log("StudentDeclarationInternat: ", this.lastValue.params.value);
            break;
          case 'StudentListZsti':
            this.StudentListZsti.next(this.lastValue.params.value);
            console.log("StudentListZsti: ", this.lastValue.params.value);
            break;
          case 'StudentListInternat':
            this.StudentListInternat.next(this.lastValue.params.value);
            console.log("StudentListInternat: ", this.lastValue.params.value);
            break;
          case 'StudentZstiDays':
            this.StudentZstiDays.next(this.lastValue.params.value);
            this.lastValue.params.value.forEach((element:any)=> {
              if(element.osoby_zsti_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentZstiDays.next(tempArray);
            console.log("StudentZstiDays: ", this.lastValue.params.value);
            break;
          case 'StudentDisabledZstiDays':
            this.StudentDisabledZstiDays.next(this.lastValue.params.value);
            this.lastValue.params.value.forEach((element:any)=> {
              if(element.osoby_zsti_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentDisabledZstiDays.next(tempArray);
            console.log("StudentDisabledZstiDays: ", this.lastValue.params.value);
            break;
          case 'StudentInternatDays':
            this.StudentInternatDays.next(this.lastValue.params.value);
            this.StudentInternatDays.value.forEach((element:any)=> {
              if(element.osoby_internat_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentInternatDays.next(tempArray);
            console.log("StudentInternatDays: ", this.lastValue.params.value);
            break;
          case 'StudentDisabledInternatDays':
            this.StudentDisabledInternatDays.next(this.lastValue.params.value);
            this.StudentDisabledInternatDays.value.forEach((element:any)=> {
              if(element.osoby_internat_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentDisabledInternatDays.next(tempArray);
            console.log("StudentDisabledInternatDays: ", this.lastValue.params.value);
            break;
          case 'DisabledDays':
            this.DisabledDays.next(this.lastValue.params.value);
            console.log("DisabledDays: ", this.lastValue.params.value);
            break;
          case 'SchoolYears':
            this.SchoolYears.next(this.lastValue.params.value);
            break;
          case 'LastStudentInsertId':
            this.LastStudentInsertId.next(this.lastValue.params.value)
            break;
          case 'PaymentZsti':
            this.PaymentZsti.next(this.lastValue.params.value);
            break;
          case 'CardsZsti':
            this.CardsZsti.next(this.lastValue.params.value);
            this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
            console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
            break;
        }
      })
    this.getCardsZsti();
    this.getStudentList();
    this.getDisabledDays();
    this.getSchoolYears();
    this.getPaymentZsti();
  }
}
