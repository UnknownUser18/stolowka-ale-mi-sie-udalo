// (global as any).WebSocket = require('ws');
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  socket: WebSocket | undefined;
  DisabledZstiDays = new BehaviorSubject<any>(null);
  DisabledInternatDays = new BehaviorSubject<any>(null);
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
  PaymentInternat = new BehaviorSubject<any>(null);
  CardsZsti = new BehaviorSubject<any>(null)
  CurrentStudentCardZsti = new BehaviorSubject<any>(null)
  CardsInternat = new BehaviorSubject<any>(null);
  CurrentStudentCardInternat = new BehaviorSubject<any>(null)
  CurrentStudentCardFromKeyCard = new BehaviorSubject<any>(null);
  ScanZsti = new BehaviorSubject<any>(null);
  ScanInternat = new BehaviorSubject<any>(null);
  CurrentStudentScan = new BehaviorSubject<any>(null);
  AllStudentDeclarations = new BehaviorSubject<any>(null);
  ListOfGroups = new BehaviorSubject<any>(null);
  nullKarta = {
    id: -1,
    id_ucznia: -1,
    key_card: -1,
    data_wydania: '',
    ostatnie_uzycie: ''
  }
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
      console.error('WebSocket connection error')
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
  getPaymentInternat()
  {
    this.send(JSON.stringify({action: "request", params: {method: 'getPaymentInternat'}}))
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
  getDisabledZstiDays()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getDisabledZstiDays"}}));
  }
  getDisabledInternatDays() {
    this.send(JSON.stringify({action: "request", params: {method: "getDisabledInternatDays"}}));
  }
  getCardsZsti()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getKartyZsti"}}))
  }

  getCardsInternat()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getKartyInternat"}}))
  }

  getGroups()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getGroups"}}));
  }

  getScanZsti()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getScanZsti"}}));
  }

  getScanInternat()
  {
    this.send(JSON.stringify({action: "request", params: {method: "getScanInternat"}}));
  }

  getStudentFromCardZsti(keyCard:number)
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentFromCardZsti", keyCard: keyCard}}));
  }

  getStudentFromCardInternat(keyCard:number)
  {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentFromCardInternat", keyCard: keyCard}}));
  }


  changeStudent(Id:number, type:string):void {
    this.CurrentStudentId.next(Id)
    this.StudentType.next(type)
    // console.log("Change student call")
    // console.log(Id, type)
    if (this.StudentType.value === "ZSTI") {
      this.getStudentDeclarationZsti()
      // console.log(this.StudentDeclarationInternat.value, "NMIGER")
      // console.log(this.CurrentStudentDeclaration, this.CurrentStudentId)
      this.getStudentZstiDays()
      this.getStudentDisabledZstiDays()
      if(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
        this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
      else
        this.CurrentStudentCardZsti.next(this.nullKarta)
      // console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
    }
    else{
      // console.log("Checking internat cards:")
      this.getStudentDeclarationInternat()
      // console.log(this.StudentDeclarationInternat.value, "NMIGER")
      // console.log(this.CurrentStudentDeclaration, this.CurrentStudentId)
      this.getStudentInternatDays()
      this.getStudentDisabledInternatDays()
      this.getDisabledInternatDays();
      // console.log("ZMIANA KARTY: ", this.CardsInternat.value, this.CurrentStudentCardInternat.value)
      if(this.CardsInternat.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
        this.CurrentStudentCardInternat.next(this.CardsInternat.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
      else
        this.CurrentStudentCardInternat.next(this.nullKarta)
    }
    // console.log("CURRENT STUDENT DECLARATION: ", this.CurrentStudentDeclaration)
  }

  send(query:string)
  {
    if(this.socket) this.socket.send(query);
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
          this.CurrentStudentDeclaration.next(this.StudentDeclarationZsti.value.find((element:any) => element.id_osoby == this.CurrentStudentId.value));
          this.AllStudentDeclarations.next(this.StudentDeclarationZsti.value.find((element:any) => element.id_osoby == this.CurrentStudentId.value))
          // console.log("StudentDeclarationZsti: ", this.lastValue.params.value, this.CurrentStudentDeclaration.value);
          break;
        case 'StudentDeclarationInternat':
          this.StudentDeclarationInternat.next(this.lastValue.params.value );
          this.CurrentStudentDeclaration.next(this.StudentDeclarationInternat.value.find((element:any)=> element.osoby_internat_id == this.CurrentStudentId.value && new Date(element.data_od) <= new Date() && new Date() <= new Date(element.data_do)))
          this.AllStudentDeclarations.next(this.StudentDeclarationInternat.value.find((element:any) => element.osoby_internat_id == this.CurrentStudentId.value))
          // console.log("StudentDeclarationInternat: ", this.lastValue.params.value, this.CurrentStudentDeclaration.value);
          break;
        case 'StudentListZsti':
          this.StudentListZsti.next(this.lastValue.params.value);
          // console.log("StudentListZsti: ", this.lastValue.params.value);
          break;
        case 'StudentListInternat':
          this.StudentListInternat.next(this.lastValue.params.value);
          // console.log("StudentListInternat: ", this.lastValue.params.value);
          break;
        case 'StudentZstiDays':
          this.StudentZstiDays.next(this.lastValue.params.value);
          this.lastValue.params.value.forEach((element:any)=> {
            if(element.osoby_zsti_id === this.CurrentStudentId.value)
              tempArray.push(element)
          })
          this.CurrentZstiDays.next(tempArray);
          // console.log("StudentZstiDays: ", this.lastValue.params.value);
          break;
        case 'StudentDisabledZstiDays':
          this.StudentDisabledZstiDays.next(this.lastValue.params.value);
          this.lastValue.params.value.forEach((element:any)=> {
            if(element.osoby_zsti_id === this.CurrentStudentId.value)
              tempArray.push(element)
          })
          this.CurrentDisabledZstiDays.next(tempArray);
          // console.log("StudentDisabledZstiDays: ", this.lastValue.params.value);
          break;
        case 'DisabledZstiDays':
          this.DisabledZstiDays.next(this.lastValue.params.value);
          // console.log("DisabledZstiDays: ", this.lastValue.params.value);
          break;
        case 'StudentInternatDays':
          this.StudentInternatDays.next(this.lastValue.params.value);
          this.StudentInternatDays.value.forEach((element:any)=> {
            if(element.osoby_internat_id === this.CurrentStudentId.value)
              tempArray.push(element)
          })
          this.CurrentInternatDays.next(tempArray);
          // console.log("StudentInternatDays: ", this.lastValue.params.value);
          break;
        case 'StudentDisabledInternatDays':
          this.StudentDisabledInternatDays.next(this.lastValue.params.value);
          this.StudentDisabledInternatDays.value.forEach((element:any)=> {
            if(element.osoby_internat_id === this.CurrentStudentId.value)
              tempArray.push(element)
          })
          this.CurrentDisabledInternatDays.next(tempArray);
          // console.log("StudentDisabledInternatDays: ", this.lastValue.params.value);
          break;
        case 'DisabledInternatDays':
          this.DisabledInternatDays.next(this.lastValue.params.value);
          // console.log("DisabledInternatDays: ", this.lastValue.params.value);
          break;
        case 'DisabledDays':
          this.DisabledDays.next(this.lastValue.params.value);
          // console.log("DisabledDays: ", this.lastValue.params.value);
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
        case 'PaymentInternat':
          this.PaymentInternat.next(this.lastValue.params.value);
          break;
        case 'CardsZsti':
          this.CardsZsti.next(this.lastValue.params.value);
          this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
          // console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
          break;
        case 'CardsInternat':
          this.CardsInternat.next(this.lastValue.params.value);
          this.CurrentStudentCardInternat.next(this.CardsInternat.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
          // console.log("ZMIANA KARTY: ", this.CardsInternat.value, this.CurrentStudentCardInternat.value)
          break;
        case 'ListOfGroups':
          this.ListOfGroups.next(this.lastValue.params.value);
          console.warn(this.ListOfGroups.value)
          break;
        case 'ScanZsti':
          this.ScanZsti.next(this.lastValue.params.value);
          this.CurrentStudentScan.next(this.lastValue.params.value.filter((element:any)=>element.id_karty == this.CurrentStudentCardFromKeyCard.value.id))
          break;
        case 'ScanInternat':
          this.ScanInternat.next(this.lastValue.params.value);
          this.CurrentStudentScan.next(this.lastValue.params.value.filter((element:any)=>element.id_karty == this.CurrentStudentCardFromKeyCard.value.id));
          break;
        case 'StudentCardZsti':
          this.CurrentStudentCardFromKeyCard.next(this.lastValue.params.value);
          console.warn('niga')
          break;
        case 'StudentCardInternat':
          this.CurrentStudentCardFromKeyCard.next(this.lastValue.params.value);
          console.warn('niga')
          break;
      }
    })
    this.getCardsZsti();
    this.getCardsInternat();
    this.getStudentList();
    this.getDisabledDays();
    this.getDisabledZstiDays();
    this.getDisabledInternatDays();
    this.getSchoolYears();
    this.getPaymentZsti();
    this.getPaymentInternat();
    this.getStudentDeclarationZsti();
    this.getStudentDeclarationInternat();
    this.getGroups()
  }

  sendDeclaration(declaration: {end_date: any; begin_date: any; dni_tygodnia: any[]; wersja_posilku: any; opis: any}) {

  }

  deleteDeclaration(id: number) {

  }
}
