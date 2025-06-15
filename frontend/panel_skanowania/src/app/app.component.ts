import {Component, ElementRef, ViewChild} from '@angular/core';
import {NfcScanComponent} from './nfc-scan/nfc-scan.component';
import {ClockComponent} from './clock/clock.component';
import {UserDataDisplayComponent} from './user-data-display/user-data-display.component';
import {RestartComponent} from './restart/restart.component';
import {AbsenceDay, CardDetails, DataService, Declaration, Payment, Scan} from './data.service';
import {NgOptimizedImage} from '@angular/common';

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

  constructor(private dataService: DataService) {
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
    this.enterInfo = this.parseUserData(declaration, absences, payments, scans)
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

  private checkAbsences(absences: AbsenceDay[]): boolean {
    return !absences.find((absence: AbsenceDay) =>
      (this.formatAbsence(new Date(absence.dzien_wypisania)) === this.formatAbsence(this.today))
    )
  }

  private checkDeclaration(declaration: Declaration): boolean {
    const day = this.today.getDay();
    if([0, 6].includes(day)) return false;
    return declaration.dni[day - 1] === '1';
  }

  private checkPayments(payments: Payment[], user: CardDetails): boolean {
    if(user.miasto) return true;
    return !payments.find((payment: Payment) => (payment.miesiac === (this.today.getMonth() + 1)));
  }

  private checkScans(scans: Scan[]){
    return !scans.find((scan: Scan) =>
      (this.formatAbsence(new Date(scan.czas)) === this.formatAbsence(this.today))
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

  private parseUserData(declaration?: Declaration, absences: AbsenceDay[] = [], payments: Payment[] = [], scans: Scan[] = []): affirmationInfo {
    let info: affirmationInfo = {message: "Uczeń może wejść", isAbleToEnter: true};
    if (!declaration)
      return {message: 'Uczeń nie posiada deklaracji', isAbleToEnter: false};
    if(!this.checkScans(scans))
      info = {message: 'Uczeń już odebrał obiad w dniu dzisiejszym', isAbleToEnter: false};
    if(!this.checkPayments(payments, this.user!))
      info = {message: 'Uczeń nie zapłacił za obiad w dniu dzisiejszym', isAbleToEnter: false};
    if(!this.checkAbsences(absences))
      info = {message: 'Uczeń jest zwolniony z obiadów w dniu dzisiejszym', isAbleToEnter: false};
    if(!this.checkDeclaration(declaration))
      info = {message: 'Uczeń nie je obiadów w ten dzień tygodnia', isAbleToEnter: false};
    if(!this.checkDate())
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

  private getDeclarationForUser(user: CardDetails): Declaration | undefined {
    return this.dataService.get('declarationList')?.find((declaration: Declaration) =>
      (new Date(declaration.data_od) <= this.today && this.today <= new Date(declaration.data_do)) &&
      (declaration.id_osoby === user.id_ucznia)
    )
  }

  private getAbsenceForUser(user: CardDetails): Array<AbsenceDay> | undefined {
    return this.dataService.get('absenceDayList')?.filter((absDay: AbsenceDay) =>
      (absDay.osoby_zsti_id == user.id_ucznia)
    )
  }

  private getPaymentsForUser(user: CardDetails): Array<Payment> | undefined {
    return this.dataService.get('paymentList')?.filter((payment: Payment) =>
      (payment.id_ucznia === user.id_ucznia)
    )
  }

  private getScansForUser(user: CardDetails): Array<Scan> | undefined {
    return this.dataService.get('scanList')?.filter((scan: Scan) =>
      (scan.id_karty === user.id)
    )
  }
}
