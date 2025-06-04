import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {DataService, Declaration, Student, TypOsoby, WebSocketStatus} from '../data.service';
import {GlobalInfoService} from '../global-info.service';
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-dane',
  imports: [
    FormsModule
  ],
  templateUrl: './dane.component.html',
  styleUrl: './dane.component.scss'
})
export class DaneComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected TypOsoby = TypOsoby;
  protected user: Student | undefined;
  protected declaration : Declaration | undefined;
  protected readonly Number = Number;

  protected forms  = {
    imie_nazwisko: '',
    klasa: '',
    miasto: false,
    typ_osoby: TypOsoby.UCZEN,
    imie_nazwisko_opiekuna: '',
    telefon: '',
    email: '',
    uczeszcza: true,
  }

  constructor(private database : DataService, private globalInfo : GlobalInfoService, private cdr : ChangeDetectorRef) {}

  protected sendChanges() : void {
    if (!this.user) return;
    const data = {
      imie: this.forms.imie_nazwisko.split(' ')[0],
      nazwisko: this.forms.imie_nazwisko.split(' ')[1],
      typ_osoby_id: this.forms.typ_osoby,
      klasa: Number(this.forms.typ_osoby) === TypOsoby.UCZEN ? this.forms.klasa : '',
      miasto: this.forms.miasto ? 1 : 0,
      imie_opiekuna: this.forms.imie_nazwisko_opiekuna.split(' ')[0],
      nazwisko_opiekuna: this.forms.imie_nazwisko_opiekuna.split(' ')[1],
      telefon: this.forms.telefon.split(' ')[1],
      nr_kierunkowy: this.forms.telefon.split(' ')[0].slice(1),
      email: this.forms.email,
      uczeszcza: this.forms.uczeszcza ? 1 : 0,
    }
    this.database.request('zsti.student.update', { ...data, id: this.user.id }, 'dump').then((r) => {
      if(!r[0]) throw new Error('Nie udało się zaktualizować danych');
      this.database.request('zsti.student.getById', { id: this.user?.id }, 'student').then((payload) => {
        let user = payload[0];
        if(!user) return;
        this.user = user;
        this.globalInfo.setActiveUser(user);
      });
    });
  }


  public ngAfterViewInit(): void {
    this.globalInfo.webSocketStatus.subscribe((status) => {
      if (status !== WebSocketStatus.OPEN) return;
      this.globalInfo.activeUser.subscribe((user : Student | undefined) => {
        if (!user) return;
        this.user = user;
        this.globalInfo.setTitle(`${user.imie} ${user.nazwisko} - Dane`);
        this.globalInfo.setActiveTab('DANE');
        this.forms = {
          imie_nazwisko: user.imie + ' ' + user.nazwisko,
          klasa: user.klasa,
          miasto: user.miasto,
          typ_osoby: user.typ_osoby_id,
          imie_nazwisko_opiekuna: user.imie_opiekuna + ' ' + user.nazwisko_opiekuna,
          telefon: `+${user.nr_kierunkowy} ${user.telefon}`,
          email: user.email,
          uczeszcza: user.uczeszcza
        };
        this.cdr.detectChanges();
      });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
