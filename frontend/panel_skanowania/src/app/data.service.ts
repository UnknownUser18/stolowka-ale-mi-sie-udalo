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

export interface CardDetails {
  id: number;
  id_ucznia: number;
  key_card: number;
  data_wydania: string;
  ostatnie_uzycie: string;
  typ_osoby_id: number;
  imie: string;
  nazwisko: string;
  klasa: string;
  uczeszcza: boolean;
  miasto: boolean;
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
  studentList: Student[],
  student: Student[],
  declarationList: Declaration[],
  declaration: Declaration[],
  canceledDayList: CanceledDay[],
  cardList: Card[],
  absenceDayList: AbsenceDay[],
  paymentList: Payment[],
  scanList: Scan[],
  closedDays: CanceledDay[],
  cardDetailsList: CardDetails[],
};

export type VariableName = keyof VariableTypeMap;

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
  public WS_OPENED = new Subject<void>();

  public cachedData: Map<VariableName, any> = new Map<VariableName, any>();
  public dataChange: Subject<VariableName> = new Subject<VariableName>()

  constructor() {
    this.initializeWebSocket();
  }

  /**
   * @method initializeWebSocket
   *
   * @description Startuje komunikację z serwerem oraz zarządza błędami inicjalizacji
   *
   * @returns {void}
   *
   * @example
   * this.initializeWebSocket();
   * */
  initializeWebSocket(): void {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onopen = () =>
    {
      this.WS_OPENED.next();
      console.log('WebSocket connected');
    }

    this.ws.addEventListener('message', (event) => {
      const response: ServerData = JSON.parse(event.data);
      if (response.action === 'response') {
        const { variable, value } = response.params as ResponsePayload;
        this.handleResponse(variable, value);
      }
    });

    this.ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      timer(this.RECONNECT_INTERVAL).subscribe(() => this.initializeWebSocket());
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws.close();
    };
  }

  /**
   * @method handleResponse
   *
   * @description Zarządza przychodzącymi danymi z serwera
   *
   * @property {VariableName} variable - Nazwa zmiennej, do której ma być przypisana wartość
   * @property {any} value - Wartość zwrócona przez serwer
   *
   * @example
   * // Te wartości to przykładowe odebrane od serwera
   * this.handleResponse('studentList', {imie: 'Michał', nazwisko: 'wiaterek', wiek: 15});
   * */
  handleResponse(variable: VariableName, value: any) {
    console.table(value)
    this.cachedData.set(variable, value);
    this.dataChange.next(variable);
  }

  /**
   * @method get
   *
   * @description Zwraca wartość zapisaną w cachedData pod daną nazwą, z konkretnym typem
   * @property variable Nazwa zmiennej, której wartość chcemy dostać
   *
   * @returns {VariableTypeMap | undefined} - Wartość podanej zmiennej z typem tej zmiennej lub undefined, jeżeli nie było żadnych danych w tej zmiennej
   *
   * @example
   * // Get zwraca wartość o typie Student[], w tym przypadku
   * this.get('studentList');
   * */
  get<T extends VariableName>(variable: T): VariableTypeMap[T] | undefined {
    return this.cachedData.get(variable) as VariableTypeMap[T];
  }

  /**
   * @method request
   *
   * @description Wysyła zapytanie do serwera
   *
   * @property {string} method - Metoda, jaką chcemy wykonać
   * @property {Params} params={} - Parametry do wykonania metody
   * @property {VariableName} [responseVar] - Potencjalna nazwa zmiennej, do której potem chcemy przypisać dane zwrócone przez serwer
   *
   * @returns {void}
   *
   * @example
   * this.request('zsti.student.get', {}, 'studentList');
   * */
  request(method: string, params: Params = {}, responseVar?: VariableName): Promise<Array<any>> {
    if(this.ws.readyState !== WebSocket.OPEN) throw new Error('WebSocket is not ready');
    this.ws.send(JSON.stringify({
      action: 'request',
      params: {
        method,
        params,
        responseVar
      } as RequestPayload
    }))

    return new Promise((resolve, reject): void => {
      this.ws.addEventListener('message', event => {
        if(!event.data) {
          reject(new Error("Error in event.data", event.data));
          return;
        }
        let data : ServerData = JSON.parse(event.data);
        if(!data.params) {
          reject(new Error("Error in event.data.params", data.params));
          return;
        }
        if(data.params.variable === responseVar) {
          console.log(responseVar, data.params.value)
          resolve(data.params.value);
        }
      })
    })
  }
}
