// (global as any).WebSocket = require('ws');
// @ts-ignore
import {Injectable} from '@angular/core';
// @ts-ignore
import {BehaviorSubject} from 'rxjs';
import {
  DeklaracjaInternat,
  DeklaracjaZSTI,
  GetZSTIDisabledDays,
  GetInternatDisabledDays,
  OsobaZSTI,
  OsobaInternat,
  DisabledDays,
  Payments,
  Cards,
  ScanZstiExtended
} from './app.component'

// @ts-ignore
@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  private socket!: WebSocket;
  CurrentZstiDays = new BehaviorSubject<Array<GetZSTIDisabledDays>>([]);
  DisabledZstiDays = new BehaviorSubject<Array<GetZSTIDisabledDays>>([]);
  StudentZstiDays = new BehaviorSubject<Array<GetZSTIDisabledDays>>([]);
  StudentDisabledZstiDays = new BehaviorSubject<Array<GetZSTIDisabledDays>>([]);
  CurrentDisabledZstiDays = new BehaviorSubject<Array<GetZSTIDisabledDays>>([]);
  DisabledInternatDays = new BehaviorSubject<Array<GetInternatDisabledDays>>([]);
  CurrentInternatDays = new BehaviorSubject<Array<GetInternatDisabledDays>>([]);
  StudentInternatDays = new BehaviorSubject<Array<GetInternatDisabledDays>>([]);
  CurrentDisabledInternatDays = new BehaviorSubject<Array<GetInternatDisabledDays>>([]);
  StudentDisabledInternatDays = new BehaviorSubject<Array<GetInternatDisabledDays>>([]);
  StudentDeclarationZsti = new BehaviorSubject<Array<DeklaracjaZSTI>>([]);
  CurrentStudentDeclaration = new BehaviorSubject<DeklaracjaZSTI | DeklaracjaInternat | undefined>(new DeklaracjaZSTI());
  StudentDeclarationInternat = new BehaviorSubject<Array<DeklaracjaInternat>>([]);
  AllStudentDeclarations = new BehaviorSubject<Array<DeklaracjaZSTI> | Array<DeklaracjaInternat>>([]);
  StudentListZsti = new BehaviorSubject<Array<OsobaZSTI>>([]);
  StudentListInternat = new BehaviorSubject<Array<OsobaInternat>>([]);
  CurrentStudentId = new BehaviorSubject<number>(-1)
  StudentType = new BehaviorSubject<string>("BRAK")
  DisabledDays = new BehaviorSubject<Array<DisabledDays>>([]);
  TypPosilkuSaved = new BehaviorSubject<boolean>(true)
  SelectedSaved = new BehaviorSubject<boolean>(true)
  PersonalDataSaved = new BehaviorSubject<boolean>(true)
  DeclarationDataSaved = new BehaviorSubject<boolean>(true)
  SchoolYears = new BehaviorSubject<any>(null)
  LastStudentInsertId = new BehaviorSubject<number>(0)
  PaymentZsti = new BehaviorSubject<Array<Payments>>([])
  PaymentInternat = new BehaviorSubject<Array<Payments>>([]);
  CardsZsti = new BehaviorSubject<Array<Cards>>([])
  CardsInternat = new BehaviorSubject<Array<Cards>>([]);
  ScanZstiMoreInfo = new BehaviorSubject<Array<ScanZstiExtended>>([])
  CurrentStudentCardZsti = new BehaviorSubject<any>(null)
  CurrentStudentCardInternat = new BehaviorSubject<any>(null)
  ListOfGroups = new BehaviorSubject<any>(null);
  CurrentStudent = new BehaviorSubject<any>(null)
  lastValue:any = null;
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
  private initWebSocket(): void {
    try {
      // Use browser-native WebSocket
      this.socket = new WebSocket('ws://localhost:8080');

      // Simplified event handlers
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.Initialize();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setTimeout(() => this.initWebSocket(), 1000);
      };

    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }
  constructor() {
    // Use browser-only initialization
    if (typeof window !== 'undefined') {
      setTimeout(() => this.initWebSocket(), 500);
    }
  }
  public changeSelectedSaved(change:boolean) : void {
    this.SelectedSaved.next(change)
  }

  public changeTypPoslikuSaved(change:boolean) : void {
    this.TypPosilkuSaved.next(change);
  }

  public formatDate(date:Date | string): string {
    date = new Date(date);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate()).toString().padStart(2, '0')}`;
  }

  public changeDeclarationDataSaved(change:boolean) : void {
    this.DeclarationDataSaved.next(change);
  }
  getDisabledDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getDniNieczynne"}}));
  }
  getPaymentZsti() : void {
    this.send(JSON.stringify({action: "request", params: {method: 'getPaymentZsti'}}))
  }
  getPaymentInternat() : void {
    this.send(JSON.stringify({action: "request", params: {method: 'getPaymentInternat'}}))
  }
  getStudentInternatDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentInternatDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDisabledInternatDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDisabledInternatDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentZstiDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentZstiDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDisabledZstiDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDisabledZstiDays", studentId: this.CurrentStudentId.value}}));
  }
  getStudentDeclarationZsti() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentDeclarationZsti"}}));
  }
  getStudentDeclarationInternat() : void {
    this.send( JSON.stringify({action: "request", params: {method: "getStudentDeclarationInternat"}}));
  }

  getStudentList() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getStudentListInternat"}}))
    this.send(JSON.stringify({action: "request", params: {method: "getStudentListZsti"}}))
  }

  getSchoolYears() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getSchoolYears"}}));
  }
  getDisabledZstiDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getDisabledZstiDays"}}));
  }
  getDisabledInternatDays() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getDisabledInternatDays"}}));
  }
  getCardsZsti() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getKartyZsti"}}))
  }

  getCardsInternat() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getKartyInternat"}}))
  }

  getGroups() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getGroups"}}));
  }

  getScanZstiMoreInfo() : void {
    this.send(JSON.stringify({action: "request", params: {method: "getScanZstiMoreInfo"}}));
  }
  changeStudent(Id:number, type:string):void {
    this.CurrentStudentId.next(Id)
    this.StudentType.next(type)
    console.warn("Change student call")
    // console.log(Id, type)
    if (this.StudentType.value === "ZSTI") {
      this.CurrentStudent.next(this.StudentListZsti.value.find((item: OsobaZSTI)=> item.id == this.CurrentStudentId.value));
      this.getStudentDeclarationZsti()
      this.getStudentZstiDays()
      this.getStudentDisabledZstiDays()
      if(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
        this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
      else
        this.CurrentStudentCardZsti.next(this.nullKarta)
      // console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
    }
    else{
      this.CurrentStudent.next(this.StudentListInternat.value.find((item: OsobaInternat)=> item.id == this.CurrentStudentId.value));
      // console.log("Checking internat cards:")
      this.getStudentDeclarationInternat()
      // console.log(this.StudentDeclarationInternat.value, "NMIGER")
      this.getStudentInternatDays()
      this.getStudentDisabledInternatDays()
      this.getDisabledInternatDays();
      // console.log("ZMIANA KARTY: ", this.CardsInternat.value, this.CurrentStudentCardInternat.value)
      if(this.CardsInternat.value.find((element:any)=> element.id_ucznia == this.CurrentStudentId.value))
        this.CurrentStudentCardInternat.next(this.CardsInternat.value.find((element:any)=>element.id_ucznia == this.CurrentStudentId.value))
      else
        this.CurrentStudentCardInternat.next(this.nullKarta)
    }
    // console.log("CURRENT STUDENT DECLARATION: ", this.CurrentStudentDeclaration.value)
  }

  send(query:string)
  {
    if(this.socket) this.socket.send(query);
  }
adjustDateTime(dateString: string): string {
  const date = new Date(dateString);
  if (date.getUTCHours() >= 20 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    date.setUTCHours(0, 0, 0, 0);
  }
  return date.toISOString();
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
            this.lastValue.params.value.forEach((element:DeklaracjaZSTI) => {
              element.data_od = this.adjustDateTime(element.data_od!);
              element.data_do = this.adjustDateTime(element.data_do!);
            });
            this.StudentDeclarationZsti.next(this.lastValue.params.value as Array<DeklaracjaZSTI>);
            // console.log(this.CurrentStudentId.value);
            this.CurrentStudentDeclaration.next(this.StudentDeclarationZsti.value.find((element:DeklaracjaZSTI) => element.id_osoby == this.CurrentStudentId.value));
            this.AllStudentDeclarations.next(this.StudentDeclarationZsti.value.filter((element:DeklaracjaZSTI) => element.id_osoby == this.CurrentStudentId.value))
            console.log("StudentDeclarationZsti: ", this.lastValue.params.value, this.CurrentStudentDeclaration.value, this.AllStudentDeclarations.value);
            break;
          case 'StudentDeclarationInternat':
            this.lastValue.params.value.forEach((element:DeklaracjaInternat) => {
              element.data_od = this.adjustDateTime(element.data_od!);
              element.data_do = this.adjustDateTime(element.data_do!);
            });
            this.StudentDeclarationInternat.next(this.lastValue.params.value as Array<DeklaracjaInternat>);
            this.CurrentStudentDeclaration.next(this.StudentDeclarationInternat.value.find((element:any)=> element.osoby_internat_id == this.CurrentStudentId.value))
            this.AllStudentDeclarations.next(this.StudentDeclarationInternat.value.filter((element:any) => element.osoby_internat_id == this.CurrentStudentId.value))
            // console.log("StudentDeclarationInternat: ", this.lastValue.params.value, this.CurrentStudentDeclaration.value);
            break;
          case 'StudentListZsti':
            this.StudentListZsti.next(this.lastValue.params.value as Array<OsobaZSTI>);
            // console.log("StudentListZsti: ", this.lastValue.params.value);
            break;
          case 'StudentListInternat':
            this.StudentListInternat.next(this.lastValue.params.value as Array<OsobaInternat>);
            // console.log("StudentListInternat: ", this.lastValue.params.value);
            break;
          case 'StudentZstiDays':
            this.StudentZstiDays.next(this.lastValue.params.value as Array<GetZSTIDisabledDays>);
            this.lastValue.params.value.forEach((element:GetZSTIDisabledDays)=> {
              if(element.osoby_zsti_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentZstiDays.next(tempArray as Array<GetZSTIDisabledDays>);
            // console.log("StudentZstiDays: ", this.lastValue.params.value);
            break;
          case 'StudentDisabledZstiDays':
            this.StudentDisabledZstiDays.next(this.lastValue.params.value as Array<GetZSTIDisabledDays>);
            this.lastValue.params.value.forEach((element:GetZSTIDisabledDays)=> {
              if(element.osoby_zsti_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentDisabledZstiDays.next(tempArray as Array<GetZSTIDisabledDays>);
            // console.log("StudentDisabledZstiDays: ", this.lastValue.params.value);
            break;
            case 'DisabledZstiDays':
            this.DisabledZstiDays.next(this.lastValue.params.value as Array<GetZSTIDisabledDays>);
            // console.log("DisabledZstiDays: ", this.lastValue.params.value);
            break;
          case 'StudentInternatDays':
            this.StudentInternatDays.next(this.lastValue.params.value as Array<GetInternatDisabledDays>);
            this.StudentInternatDays.value.forEach((element:GetInternatDisabledDays)=> {
              if(element.osoby_internat_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentInternatDays.next(tempArray as Array<GetInternatDisabledDays>);
            // console.log("StudentInternatDays: ", this.lastValue.params.value);
            break;
          case 'StudentDisabledInternatDays':
            this.StudentDisabledInternatDays.next(this.lastValue.params.value as Array<GetInternatDisabledDays>);
            this.StudentDisabledInternatDays.value.forEach((element:GetInternatDisabledDays)=> {
              if(element.osoby_internat_id === this.CurrentStudentId.value)
                tempArray.push(element)
            })
            this.CurrentDisabledInternatDays.next(tempArray as Array<GetInternatDisabledDays>);
            break;
            case 'DisabledInternatDays':
              this.DisabledInternatDays.next(this.lastValue.params.value as Array<GetInternatDisabledDays>);
              break;
          case 'DisabledDays':
            this.DisabledDays.next(this.lastValue.params.value as Array<DisabledDays>);
            break;
          case 'SchoolYears':
            this.SchoolYears.next(this.lastValue.params.value);
            break;
          case 'LastStudentInsertId':
            this.LastStudentInsertId.next(parseInt(this.lastValue.params.value.insertId))
            break;
          case 'PaymentZsti':
            this.PaymentZsti.next(this.lastValue.params.value as Array<Payments>);
            break;
          case 'PaymentInternat':
            this.PaymentInternat.next(this.lastValue.params.value as Array<Payments>);
            break;
          case 'CardsZsti':
            this.CardsZsti.next(this.lastValue.params.value as Array<Cards>);
            this.CurrentStudentCardZsti.next(this.CardsZsti.value.find((element:Cards)=>element.id_ucznia == this.CurrentStudentId.value))
            // console.log("ZMIANA KARTY: ", this.CardsZsti.value, this.CurrentStudentCardZsti.value)
            break;
          case 'CardsInternat':
            this.CardsInternat.next(this.lastValue.params.value as Array<Cards>);
            this.CurrentStudentCardInternat.next(this.CardsInternat.value.find((element:Cards)=>element.id_ucznia == this.CurrentStudentId.value))
            // console.log("ZMIANA KARTY: ", this.CardsInternat.value, this.CurrentStudentCardInternat.value)
            break;
          case 'ListOfGroups':
            this.ListOfGroups.next(this.lastValue.params.value);
            break;
          case 'ScanZstiMoreInfo':
            (this.lastValue.params.value as Array<ScanZstiExtended>).forEach((item: ScanZstiExtended)=> {
              let tempDate = new Date(item.czas!);
              item.czas = `${tempDate.getFullYear()}-${tempDate.getMonth() + 1}-${tempDate.getDate()}`
              tempArray.push(item as ScanZstiExtended)
            })
            this.ScanZstiMoreInfo.next(tempArray as Array<ScanZstiExtended>);
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
    this.getScanZstiMoreInfo();
  }

}
