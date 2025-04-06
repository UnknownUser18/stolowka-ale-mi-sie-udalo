import { Injectable } from '@angular/core';
import { Subject, timer } from 'rxjs';

export interface Declaration {
  id: number;
  id_osoby: number;
  data_od: string;
  data_do: string;
  dni: string;
}

export interface CanceledDay {
  id: number;
  dzien: string;
}

export interface Card {
  id: number;
  id_ucznia: number;
  key_card: number;
  data_wydania: string;
  ostatnie_uzycie: string;
}

export interface AbsenceDay {
  id: number;
  dzien_wypisania: string;
  osoby_zsti_id: number;
}

export interface Student {
  id: number;
  typ_osoby_id: number;
  imie: string;
  nazwisko: string;
  klasa: string;
  uczeszcza: boolean;
  miasto: boolean;
}

export interface Payment {
  id: number;
  id_ucznia: number;
  platnosc: number;
  data_platnosci: string;
  miesiac: number;
  opis: string;
  rok: number;
}

export interface Scan {
  id: number;
  id_karty: number;
  czas: string;
}

export type ActionType = 'request' | 'response';

export type Params = {[key: string]: any};

export interface RequestPayload {
  method: string;
  params: {[key: string]: any};
  responseVar?: VariableName;
}

export interface ResponsePayload {
  variable: VariableName;
  value: any;
}

type VariableTypeMap = {
  studentList: Student[]
};

type VariableName = keyof VariableTypeMap;

export interface ServerData<T extends VariableName = VariableName> {
  action: ActionType;
  params: {
    variable: T;
    value: VariableTypeMap[T];
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public ws!: WebSocket;
  private readonly RECONNECT_INTERVAL = 2500;

  public cachedData: Map<VariableName, any> = new Map<VariableName, any>();
  public dataChange: Subject<VariableName> = new Subject<VariableName>()

  constructor() {
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () => console.log('WebSocket connected');

    this.ws.onmessage = (event) => {
      const response: ServerData = JSON.parse(event.data);
      if (response.action === 'response') {
        const { variable, value } = response.params as ResponsePayload;
        this.handleResponse(variable, value);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      timer(this.RECONNECT_INTERVAL).subscribe(() => this.initializeWebSocket());
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws.close();
    };
  }

  handleResponse(variable: VariableName, value: any) {
    console.log(variable, value)
    this.cachedData.set(variable, value);
    this.dataChange.next(variable);
  }

  get<T extends VariableName>(variable: T): VariableTypeMap[T] | undefined {
    return this.cachedData.get(variable) as VariableTypeMap[T];
  }

  request(method: string, params: Params = {}, responseVar?: VariableName) {
    if(this.ws.readyState !== WebSocket.OPEN) return;
    const [sector, dataPool, operation] = method.split('.');
    this.ws.send(JSON.stringify({
      action: 'request',
      params: {
        method,
        params,
        responseVar
      } as RequestPayload
    }))
    if(operation !== 'get')
    {
      const getMethod = sector + '.' + dataPool + '.get'
      this.request(getMethod, {}, 'studentList');
    }
  }
}
