// (global as any).WebSocket = require('ws');
import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  socket: WebSocket;
  StudentDeclarationZsti = new BehaviorSubject<any>(null);
  CurrentStudentDeclaration = new BehaviorSubject<any>(null);
  StudentDeclarationInternat = new BehaviorSubject<any>(null);
  StudentListZsti = new BehaviorSubject<any>(null);
  StudentListZstiData = this.StudentListZsti.asObservable();
  StudentListInternat = new BehaviorSubject<any>(null);
  StudentListInternatData = this.StudentListInternat.asObservable();
  StudentZstiDays = new BehaviorSubject<any>(null);
  StudentInternatDays = new BehaviorSubject<any>(null);
  CurrentStudentId = new BehaviorSubject<number>(-1)
  StudentType = new BehaviorSubject<string>("BRAK")
  lastValue:any = null;

  constructor() {
    this.socket = new WebSocket("ws://localhost:8080");
    // @ts-ignore
    this.socket.onopen = (event: Event) => {
      console.log('WebSocket connection established')
      this.Initialize()

    }
  }
  getStudentInternatDays()
  {
    let query = JSON.stringify(
      {
        action: "request",
        params: {
          method: "getStudentInternatDays",
          studentId: this.CurrentStudentId.value
        }
      }
    );
    this.send(query);
  }
  getStudentZstiDays()
  {
    let query = JSON.stringify(
      {
        action: "request",
        params: {
          method: "getStudentZstiDays",
          studentId: this.CurrentStudentId.value
        }
      }
    );
    this.send(query);
  }
  getStudentDeclarationZsti()
  {
    let query = JSON.stringify(
      {
        action: "request",
        params: {
          method: "getStudentDeclarationZsti",
          studentId: this.CurrentStudentId.value
        }
    }
    );
    this.send(query);
  }
  getStudentDeclarationInternat()
  {
    let query = JSON.stringify(
      {
        action: "request",
        params: {
          method: "getStudentDeclarationInternat",
          studentId: this.CurrentStudentId.value
        }
      }
    );
    this.send(query);
  }
  changeStudent(Id:number, type:string):void {
    this.CurrentStudentId.next(Id)
    this.StudentType.next(type)
    console.log(Id, type)
    if (this.StudentType.value === "ZSTI") {
      this.getStudentDeclarationZsti()
      this.getStudentZstiDays()
    }
    else{
      this.getStudentDeclarationInternat()
      this.getStudentInternatDays()
    }

  }
  send(query:string)
  {
    this.socket.send(query)
  }

  Initialize() {
      this.socket.addEventListener('message', (event) => {
        console.log("EVENT DATA: ", event.data)
        console.log('Message incoming from the server: ', event.data);
        console.log()
        if (event.data === "Succesfully connected to the server")
        {
          return
        }
        if (typeof event.data === "string") {
          this.lastValue = JSON.parse(event.data);
        }
        switch (this.lastValue.params.variable) {
          case 'StudentDeclarationZsti':
            this.StudentDeclarationZsti.next(this.lastValue.params.value);
            console.log("StudentDeclarationZsti: ", this.lastValue.params.value);
            this.lastValue.params.value.forEach((value:any) => {
              let beginDate =new Date(value.data_od)
              let endDate = new Date(value.data_do)
              if(new Date() >= beginDate && new Date() <= endDate){
                this.CurrentStudentDeclaration.next(value);
              }
            })
            console.log("CurrentStudentDeclarationZsti: ", this.CurrentStudentDeclaration.value);
            break;
          case 'StudentDeclarationInternat':
            this.StudentDeclarationInternat.next(this.lastValue.params.value);
            console.log("StudentDeclarationInternat: ", this.lastValue.params.value);
            this.lastValue.params.value.forEach((value:any) => {
              let beginDate =new Date(value.data_od)
              let endDate = new Date(value.data_do)
              if(new Date() >= beginDate && new Date() <= endDate){
                this.CurrentStudentDeclaration.next(value);
              }
            })
            console.log("CurrentStudentDeclarationInternat: ", this.CurrentStudentDeclaration.value);
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
            console.log("StudentZstiDays: ", this.lastValue.params.value);
            break;
          case 'StudentInternatDays':
            this.StudentInternatDays.next(this.lastValue.params.value);
            console.log("StudentInternatDays: ", this.lastValue.params.value);
            break;
        }
      })
      let query: string = JSON.stringify(
        {
          action: "request",
          params: {
            method: "getStudentListZsti"
          }
        }
      );
      this.send(query);
      query = JSON.stringify(
        {
          action: "request",
          params: {
            method: "getStudentListInternat"
          }
        }
      );
      this.send(query);
  }
}
