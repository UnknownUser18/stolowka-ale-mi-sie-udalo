import {Component, ElementRef, ViewChild} from '@angular/core';
import {NfcScanComponent} from './nfc-scan/nfc-scan.component';
import {ClockComponent} from './clock/clock.component';
import {UserDataDisplayComponent} from './user-data-display/user-data-display.component';
import {RestartComponent} from './restart/restart.component';
import {CardDetails, DataService, ZPayment} from './data.service';
import {NgOptimizedImage} from '@angular/common';
import {DbService, ZAbsenceDay, ZDeclaration, ZScan} from './db.service';
import {firstValueFrom} from 'rxjs';
import {environment} from '../environments/environment.development';

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
  }

  public unloadUser(): void {
    this.loadedUser = false;
  }

  public async loadNfcOutput(input: string) {
    try {
      const cards = await this.getCardsWithDetails();
      this.user = this.findUser(cards, input);

      if (!this.user) {
        this.noUserFound();
        return;
      }

      const [declaration, absences, payments, scans] = await Promise.all([
        this.getDeclarationForUser(this.user),
        this.getAbsenceForUser(this.user),
        this.getPaymentsForUser(this.user),
        this.getScansForUser(this.user)
      ]);

      this.enterInfo = this.parseUserData(declaration, absences, payments, scans, this.user);
      this.loadedUser = true;

      if (this.enterInfo.isAbleToEnter) {
        await this.scanUser(this.user);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania danych użytkownika:', error);
      this.enterInfo = {message: 'Wystąpił błąd podczas pobierania danych', isAbleToEnter: false};
      this.loadedUser = true;
    }
  }

  private dateToDBDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private async scanUser(user: CardDetails) {
    try {
      this.database.addZScansPerson(user.id, this.dateToDBDate(new Date())).subscribe({
        next: (res) => console.log('Skan zapisany:', res),
        error: (err) => console.error('Błąd podczas zapisywania skanu:', err)
      });
    } catch (error) {
      console.error('Błąd podczas skanowania użytkownika:', error);
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private checkAbsences(absences: ZAbsenceDay[] | null): boolean {
    if (!absences || absences.length === 0) return true;

    const todayFormatted = this.formatDate(this.today);
    return !absences.some((absence: ZAbsenceDay) =>
      this.formatDate(new Date(absence.dzien_wypisania)) === todayFormatted
    );
  }

  private checkDeclaration(declaration: ZDeclaration): boolean {
    const day = this.today.getDay();

    if (day === 0 || day === 6) return false;

    return declaration.dni[day - 1] === '1';
  }

  private checkPayments(payments: ZPayment[] | null, user: CardDetails): boolean {
    // Uczniowie opłacani przez miasto zawsze mogą korzystać z obiadów
    if (user.miasto) return true;

    if (!payments || payments.length === 0) return false;

    const currentMonth = this.today.getMonth() + 1;
    const currentYear = this.today.getFullYear();

    return payments.some((payment: ZPayment) =>
      payment.miesiac === currentMonth && payment.rok === currentYear
    );
  }

  private checkScans(scans: ZScan[] | null): boolean {
    if (!scans || scans.length === 0) return true;

    const todayFormatted = this.formatDate(this.today);
    return !scans.some((scan: ZScan) =>
      this.formatDate(new Date(scan.czas)) === todayFormatted
    );
  }

  private checkDate(): boolean {
    const now = new Date();
    const start = new Date();
    start.setHours(environment.obiadConfig.startHour, 0, 0, 0);
    const end = new Date();
    end.setHours(environment.obiadConfig.endHour, 0, 0, 0);

    return now >= start && now <= end;
  }

  private parseUserData(
    declaration: ZDeclaration[] | null,
    absences: ZAbsenceDay[] | null,
    payments: ZPayment[] | null,
    scans: ZScan[] | null,
    user: CardDetails
  ): affirmationInfo {
    // Sprawdzenie, czy jest godzina obiadowa
    if (!this.checkDate()) {
      return {message: `Poza godzinami obiadowymi (${environment.obiadConfig.startHour}:00 - ${environment.obiadConfig.endHour}:00)`, isAbleToEnter: false};
    }

    // Czy istnieje deklaracja
    if (!declaration || declaration.length === 0) {
      return {message: 'Uczeń nie posiada deklaracji', isAbleToEnter: false};
    }

    // Deklaracje ucznia-czy je obiady w ten dzień
    if (!this.checkDeclaration(declaration[0])) {
      return {message: 'Uczeń nie je obiadów w ten dzień tygodnia', isAbleToEnter: false};
    }

    // Zgłoszone nieobecności na obiedzie
    if (!this.checkAbsences(absences)) {
      return {message: 'Uczeń jest zwolniony z obiadów w dniu dzisiejszym', isAbleToEnter: false};
    }

    // Płatności ucznia na ten miesiąc
    if (!this.checkPayments(payments, user)) {
      return {message: 'Uczeń nie zapłacił za obiad w bieżącym miesiącu', isAbleToEnter: false};
    }

    // Skany z dzisiaj-czy już odebrał
    if (!this.checkScans(scans)) {
      return {message: 'Uczeń już odebrał obiad w dniu dzisiejszym', isAbleToEnter: false};
    }

    // Oki olo
    return {message: "Uczeń może wejść", isAbleToEnter: true};
  }

  noUserFound() {
    this.user = {
      id: 0,
      imie: 'Nie znaleziono',
      nazwisko: 'ucznia :/',
      uczeszcza: false,
      typ_osoby_id: 0,
      id_ucznia: 0,
      klasa: '',
      ostatnie_uzycie: this.today,
      data_wydania: this.today,
      key_card: 0,
      miasto: false
    };
    this.enterInfo = {message: 'Wprowadzono złe ID lub napotkano nieznany błąd', isAbleToEnter: false};
    this.loadedUser = true;
  }

  public findUser(list: CardDetails[] | null, input: string): CardDetails | undefined {
    if (!list || list.length === 0) return undefined;
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
    return await firstValueFrom(this.database.getZScansPerson(user.id))
  }

  private async getCardsWithDetails(): Promise<CardDetails[] | null> {
    return await firstValueFrom(this.database.getZCardsWithDetails())
  }
}
