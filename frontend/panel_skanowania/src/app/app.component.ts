import {Component, ElementRef, ViewChild} from '@angular/core';
import {NfcScanComponent} from './nfc-scan/nfc-scan.component';
import {ClockComponent} from './clock/clock.component';
import {UserDataDisplayComponent} from './user-data-display/user-data-display.component';
import {RestartComponent} from './restart/restart.component';
import {AbsenceDay, CardDetails, DataService, Declaration, ZPayment, Scan} from './data.service';
import {NgOptimizedImage} from '@angular/common';
import {DbService, ZAbsenceDay, ZDeclaration, ZScan} from './db.service';
import {firstValueFrom} from 'rxjs';

export interface affirmationInfo{
  message: string;
  isAbleToEnter: boolean;
}



@Component({
  selector: 'app-root',
  imports: [
    NfcScanComponent,
    ClockComponent,
    UserDataDisplayComponent,
    RestartComponent,
    NgOptimizedImage,
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('main') main!: ElementRef;
  title = 'Panel Skanowania';
  loadedUser: boolean = false;
  user: CardDetails | undefined;
  enterInfo: affirmationInfo = {message: "nothing happened", isAbleToEnter: true};
  today: Date = new Date();

  constructor(private dataService: DataService, private database: DbService) {
    this.dataService.WS_OPENED.subscribe(async () => {await this.fetchInitialData()})
  }

  private async fetchInitialData(): Promise<void> {
    await this.dataService.request('zsti.payment.get', {}, 'paymentList');
    await this.dataService.request('zsti.scan.get', {}, 'scanList');
    await this.dataService.request('zsti.absence.get', {}, 'absenceDayList');
    await this.dataService.request('zsti.declaration.get', {}, 'declarationList');
    await this.dataService.request('zsti.card.getWithDetails', {}, "cardDetailsList")
    // alert('All initial data is fetched!')
  }

  public unloadUser(): void {
    this.loadedUser = false;
    console.log('loadedUser');
  }

  public async loadNfcOutput(input: string) {
    console.log(input);
    this.user = this.findUser(await this.dataService.request('zsti.card.getWithDetails', {}, "cardDetailsList"), input)
    console.log(this.user);
    if (!this.user) {
      this.noUserFound();
      return;
    }
    const [declaration, absences, payments, scans] =
      [this.getDeclarationForUser(this.user),
      this.getAbsenceForUser(this.user),
      this.getPaymentsForUser(this.user),
      this.getScansForUser(this.user)];
    this.enterInfo = this.parseUserData(await declaration, await absences, await payments, await scans)
    this.loadedUser = true;
    console.log(this.user, this.enterInfo);
    if(this.enterInfo.isAbleToEnter)
      this.scanUser(this.user).then(() => {
        this.fetchInitialData()
      })
    else
      await this.fetchInitialData()
  }

  private dateToDBDate(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }

  private async scanUser(user: CardDetails) {
    this.dataService.request('zsti.scan.add', {
     id_karty: user.id,
      czas: this.dateToDBDate(new Date())
    }).then(() => {
      console.log('promise resolved')
      return this.dataService.request('zsti.scan.get', {}, 'scanList');
    })
  }

  private formatAbsence(date: Date): string{
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  private checkAbsences(absences: ZAbsenceDay[]): boolean {
    return !absences.find((absence: ZAbsenceDay) =>
      (this.formatAbsence(new Date(absence.dzien_wypisania)) === this.formatAbsence(this.today))
    )
  }

  private checkDeclaration(declaration: ZDeclaration): boolean {
    const day = this.today.getDay();
    if([0, 6].includes(day)) return false;
    return declaration.dni[day - 1] === '1';
  }

  private checkPayments(payments: ZPayment[], user: CardDetails): boolean {
    if(user.miasto) return true;
    return !payments.find((payment: ZPayment) => (payment.miesiac === (this.today.getMonth() + 1)));
  }

  private checkScans(scans: ZScan[]){
    return !scans.find((scan: ZScan) =>
      (this.formatAbsence(scan.czas) === this.formatAbsence(this.today))
    )
  }

  private checkDate(){
    const date = new Date();
    const start = (new Date());
    start.setHours(12, 0, 0, 0);
    const end = (new Date());
    end.setHours(18, 0, 0,0);
    return (start <= date) && (date <= end);
  }

  private parseUserData(declaration?: ZDeclaration[] | null, absences: ZAbsenceDay[] | null = null, payments: ZPayment[] | null = null, scans: ZScan[] | null = null): affirmationInfo {
    let info: affirmationInfo = {message: "Uczeń może wejść", isAbleToEnter: true};
    if (!declaration)
      return {message: 'Uczeń nie posiada deklaracji', isAbleToEnter: false};
    else if(scans && !this.checkScans(scans))
      info = {message: 'Uczeń już odebrał obiad w dniu dzisiejszym', isAbleToEnter: false};
    else if(payments && !this.checkPayments(payments, this.user!))
      info = {message: 'Uczeń nie zapłacił za obiad w dniu dzisiejszym', isAbleToEnter: false};
    else if(absences && !this.checkAbsences(absences))
      info = {message: 'Uczeń jest zwolniony z obiadów w dniu dzisiejszym', isAbleToEnter: false};
    else if(!this.checkDeclaration(declaration[0]))
      info = {message: 'Uczeń nie je obiadów w ten dzień tygodnia', isAbleToEnter: false};
    else if(!this.checkDate())
      info = {message: 'Poza godzinami obiadowymi', isAbleToEnter: false};
    return info;
  }

  noUserFound() {
    this.user = {id: 0, imie: 'Nie znaleziono', nazwisko: 'ucznia :/', uczeszcza: false, typ_osoby_id: 0, id_ucznia: 0, klasa: '', ostatnie_uzycie: '', data_wydania: '', key_card: 0, miasto: false}
    this.enterInfo = {message: 'Wprowadzono złe ID lub napotkano nieznany błąd', isAbleToEnter: false};
    this.loadedUser = true;
  }

  public findUser(list: CardDetails[], input: string): CardDetails | undefined {
    console.table(list);

    return list.find((userCard: CardDetails) => userCard.key_card.toString() === input);
  }

  private async getDeclarationForUser(user: CardDetails): Promise<ZDeclaration[] | null> {
    return await firstValueFrom(this.database.getZDeclarationsPersonInDate(user.id_ucznia, this.today))
  }

  private async getAbsenceForUser(user: CardDetails): Promise<ZAbsenceDay[] | null> {
    return await firstValueFrom(this.database.getZAbsenceDaysPerson(user.id_ucznia))
  }

  private async getPaymentsForUser(user: CardDetails): Promise<ZPayment[] | null> {
    return await firstValueFrom(this.database.getZPaymentsPerson(user.id_ucznia))
  }

  private async getScansForUser(user: CardDetails): Promise<ZScan[] | null> {
    return await firstValueFrom(this.database.getZScansPerson(user.id_ucznia))
  }
}
