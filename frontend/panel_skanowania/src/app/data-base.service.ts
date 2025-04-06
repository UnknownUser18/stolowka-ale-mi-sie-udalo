import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataBaseService {
  socket: WebSocket | undefined;
  lastValue: any = {};
  public keycardInput = new BehaviorSubject<string>('');
  StudentType = new BehaviorSubject<string>('');
  CurrentStudent = new BehaviorSubject<any>(null);

  PaymentInternat = new BehaviorSubject<any>(null);
  PaymentZsti = new BehaviorSubject<any>(null);
  DisabledDays = new BehaviorSubject<any>(null);
  DisabledInternatDays = new BehaviorSubject<any>(null);
  CurrentDisabledInternatDays = new BehaviorSubject<any>(null);
  StudentZstiDays = new BehaviorSubject<any>(null);
  CurrentStudentId = new BehaviorSubject<any>(null);
  CurrentInternatDays = new BehaviorSubject<any>(null);
  StudentInternatDays = new BehaviorSubject<any>(null);
  DisabledZstiDays = new BehaviorSubject<any>(null);
  CurrentDisabledZstiDays = new BehaviorSubject<any>(null);
  StudentDisabledZstiDays = new BehaviorSubject<any>(null);
  CurrentZstiDays = new BehaviorSubject<any>(null);
  StudentDisabledInternatDays = new BehaviorSubject<any>(null);
  ScanningInfoZsti = new BehaviorSubject<any>(null);
  StudentDeclarationInternat = new BehaviorSubject<any>(null);
  CurrentStudentDeclaration = new BehaviorSubject<any>(null);
  AllStudentDeclarations = new BehaviorSubject<any>(null);
  StudentDeclarationZsti = new BehaviorSubject<any>(null);
  ScanZsti = new BehaviorSubject<any>(null);
  ScanInternat = new BehaviorSubject<any>(null);
  CurrentStudentScan = new BehaviorSubject<any>(null);
  constructor() {
    // setTimeout((): void => {
      this.initWebSocket();
    // }, 50);
  }
  initWebSocket() {
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onopen = (): void => {
      console.log('WebSocket connection established');
      this.Initialize();
    };
    this.socket.onerror = (): void => {
      console.error('WebSocket connection error');
      setTimeout(() => {
        this.initWebSocket();
      }, 100);
    };
  }

  getDisabledDays(): void {
      this.simpleRequest('getDniNieczynne')
  }

  private simpleRequest(val:string) {
    this.send(
     JSON.stringify({
      action: 'request',
      params: {method: val},
    })
    )
  }

  getPaymentZsti(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getPaymentZsti' },
      })
    );
  }
  getPaymentInternat(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getPaymentInternat' },
      })
    );
  }
  getDisabledZstiDays(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getDisabledZstiDays' },
      })
    );
  }
  getDisabledInternatDays(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getDisabledInternatDays' },
      })
    );
  }
  getScanningInfoZsti(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getScanningInfoZsti' },
      })
    );
  }
  getStudentDeclarationInternat(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getStudentDeclarationInternat' },
      })
    );
  }
  getStudentDeclarationZsti(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getStudentDeclarationZsti' },
      })
    );
  }
  getScanZsti(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getScanZsti' },
      })
    );
  }
  getScanInternat(): void {
    this.send(
      JSON.stringify({
        action: 'request',
        params: { method: 'getScanInternat' },
      })
    );
  }

  send(query: string) {
    if (this.socket)
    {
      this.socket.send(query)
      return 0;
    }
    else {
      console.log('WebSocket connection not established');
      return -1;
    }
  }
  Initialize() {
    this.socket!.addEventListener('message', (event) => {
      if (event.data === 'Succesfully connected to the server') {
        return;
      }
      let tempArray: any[] = [];
      this.lastValue = JSON.parse(event.data);
      console.warn('Coś się zmieniło: ', this.lastValue)
      switch (this.lastValue.params.variable) {
        case 'StudentDeclarationZsti':
          this.StudentDeclarationZsti.next(this.lastValue.params.value);
          this.CurrentStudentDeclaration.next(
            this.StudentDeclarationZsti.value.find(
              (element: any) =>
                element.id_osoby == this.CurrentStudentId.value &&
                new Date(element.data_od) <= new Date() &&
                new Date() <= new Date(element.data_do)
            )
          );
          this.AllStudentDeclarations.next(
            this.StudentDeclarationZsti.value.find(
              (element: any) => element.id_osoby == this.CurrentStudentId.value
            )
          );
          break;
        case 'StudentDeclarationInternat':
          this.StudentDeclarationInternat.next(this.lastValue.params.value);
          this.CurrentStudentDeclaration.next(
            this.StudentDeclarationInternat.value.find(
              (element: any) =>
                element.osoby_internat_id == this.CurrentStudentId.value &&
                new Date(element.data_od) <= new Date() &&
                new Date() <= new Date(element.data_do)
            )
          );
          this.AllStudentDeclarations.next(
            this.StudentDeclarationInternat.value.find(
              (element: any) =>
                element.osoby_internat_id == this.CurrentStudentId.value
            )
          );
          break;
        case 'StudentZstiDays':
          this.StudentZstiDays.next(this.lastValue.params.value);
          this.lastValue.params.value.forEach((element: any) => {
            if (element.osoby_zsti_id === this.CurrentStudentId.value)
              tempArray.push(element);
          });
          this.CurrentZstiDays.next(tempArray);
          break;
        case 'StudentDisabledZstiDays':
          this.StudentDisabledZstiDays.next(this.lastValue.params.value);
          this.lastValue.params.value.forEach((element: any) => {
            if (element.osoby_zsti_id === this.CurrentStudentId.value)
              tempArray.push(element);
          });
          this.CurrentDisabledZstiDays.next(tempArray);
          break;
        case 'DisabledZstiDays':
          this.DisabledZstiDays.next(this.lastValue.params.value);
          break;
        case 'StudentInternatDays':
          this.StudentInternatDays.next(this.lastValue.params.value);
          this.StudentInternatDays.value.forEach((element: any) => {
            if (element.osoby_internat_id === this.CurrentStudentId.value)
              tempArray.push(element);
          });
          this.CurrentInternatDays.next(tempArray);
          break;
        case 'StudentDisabledInternatDays':
          this.StudentDisabledInternatDays.next(this.lastValue.params.value);
          this.StudentDisabledInternatDays.value.forEach((element: any) => {
            if (element.osoby_internat_id === this.CurrentStudentId.value)
              tempArray.push(element);
          });
          this.CurrentDisabledInternatDays.next(tempArray);
          break;
        case 'DisabledInternatDays':
          this.DisabledInternatDays.next(this.lastValue.params.value);
          break;
        case 'DisabledDays':
          this.DisabledDays.next(this.lastValue.params.value);
          break;
        case 'PaymentZsti':
          this.PaymentZsti.next(this.lastValue.params.value);
          break;
        case 'PaymentInternat':
          this.PaymentInternat.next(this.lastValue.params.value);

          break;
        case 'ScanningInfoZsti':
          this.ScanningInfoZsti.next(this.lastValue.params.value);
          break;
        case 'ScanInternat':
          this.ScanInternat.next(this.lastValue.params.value);
          break;
        case 'ScanZsti':
          this.ScanZsti.next(this.lastValue.params.value);
          break;
      }
    });
    this.getDisabledDays();
    this.getDisabledZstiDays();
    this.getDisabledInternatDays();
    this.getPaymentZsti();
    this.getPaymentInternat();
    this.getScanningInfoZsti();
    this.getStudentDeclarationZsti();
    this.getStudentDeclarationInternat();
    this.getScanInternat();
    this.getScanZsti();
  }

  toLength(text:string, numChars:number, charReplace: string): string
  {
    while(text.length < numChars)
    {
      text = charReplace + text;
    }
    return text;
  }
}
