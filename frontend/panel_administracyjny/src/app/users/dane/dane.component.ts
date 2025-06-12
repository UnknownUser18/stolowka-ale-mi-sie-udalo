import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { DataService, Declaration, Opiekun, Student, TypOsoby, WebSocketStatus } from '../../data.service';
import { GlobalInfoService, NotificationType } from '../../global-info.service';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector : 'app-dane',
  imports : [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl : './dane.component.html',
  styleUrl : './dane.component.scss'
})
export class DaneComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private opiekun_id : number | undefined;

  protected TypOsoby = TypOsoby;
  protected user : Student | undefined;
  protected declaration : Declaration | undefined;
  protected readonly Number = Number;

  protected forms = new FormGroup({
    imie_nazwisko : new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/)]),
    klasa : new FormControl('', Validators.required),
    miasto : new FormControl(false, Validators.required),
    typ_osoby : new FormControl(TypOsoby.UCZEN, Validators.required),
    imie_nazwisko_opiekuna : new FormControl('', Validators.pattern(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/)),
    telefon : new FormControl('', [Validators.required, Validators.pattern(/^\+\d{1,3} \d{9}$/)]),
    email : new FormControl('', [Validators.required, Validators.email]),
    uczeszcza : new FormControl(true, Validators.required),
  })

  constructor(private database : DataService, private globalInfo : GlobalInfoService, private cdr : ChangeDetectorRef) {}

  protected async sendChanges() : Promise<void> {
    if (!this.user) return;
    const forms = this.forms.value;
    if (this.forms.invalid) {
      this.forms.markAllAsTouched();
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const studentData = {
      imie : forms.imie_nazwisko?.split(' ')[0],
      nazwisko : forms.imie_nazwisko?.split(' ')[1],
      typ_osoby_id : forms.typ_osoby,
      klasa : Number(forms.typ_osoby) === TypOsoby.UCZEN ? forms.klasa : '',
      miasto : forms.miasto ? 1 : 0,
      uczeszcza : forms.uczeszcza ? 1 : 0,
    }
    const opiekunData = {
      imie_opiekuna : forms.imie_nazwisko_opiekuna?.split(' ')[0],
      nazwisko_opiekuna : forms.imie_nazwisko_opiekuna?.split(' ')[1],
      telefon : forms.telefon?.split(' ')[1],
      nr_kierunkowy : forms.telefon?.split(' ')[0].slice(1),
      email : forms.email,
      uczeszcza : forms.uczeszcza ? 1 : 0,
    }
    let result = await this.database.request('zsti.klasa.getId', { nazwa : studentData.klasa }, 'dump');
    if (!result[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Podana klasa nie istnieje.');
      return;
    }

    studentData.klasa = result[0].id;
    let updateResult = await this.database.request('zsti.student.update', { ...studentData, id : this.user.id }, 'dump');
    if (!updateResult[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować danych użytkownika.');
      return;
    }

    let guardianResult = await this.database.request('zsti.guardian.update', { ...opiekunData, id : this.opiekun_id }, 'dump')
    if (!guardianResult[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować danych opiekuna.');
      return;
    }

    let updatedStudent = await this.database.request('zsti.student.getById', { id : this.user.id }, 'student');
    if (!updatedStudent[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać danych użytkownika.');
      return;
    }

    let updatedGuardian = await this.database.request('zsti.guardian.getByStudentId', { id : this.user.id }, 'guardianList')
    if (!updatedGuardian[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać danych opiekuna.');
      return;
    }

    let klasa = await this.database.request('zsti.klasa.getById', { id : updatedStudent[0].klasa }, 'klasaList');
    if (!klasa[0]) {
      this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać danych klasy.');
      return;
    }
    const user = { ...updatedStudent[0], klasa : klasa[0].nazwa } as Student;
    const guardians = updatedGuardian as Opiekun[];
    const updatedUser = { ...user, ...guardians[0] } as Student & Opiekun;

    this.globalInfo.setActiveUser(updatedUser);
    this.user = updatedUser;
    this.globalInfo.generateNotification(NotificationType.SUCCESS, 'Dane użytkownika zostały zaktualizowane.');
  }

  private setForm(user : Student & Opiekun) : void {
    this.forms.setValue({
      imie_nazwisko : user.imie + ' ' + user.nazwisko,
      klasa : user.klasa?.toString() ?? '',
      miasto : user.miasto,
      typ_osoby : user.typ_osoby_id,
      imie_nazwisko_opiekuna : user.imie_opiekuna + ' ' + user.nazwisko_opiekuna,
      telefon : `+${ user.nr_kierunkowy } ${ user.telefon }`,
      email : user.email,
      uczeszcza : user.uczeszcza
    });
  }

  protected onTypOsobyChange() : void {
    const typOsoby = this.forms.get('typ_osoby')?.value;
    const klasa = this.forms.get('klasa');
    const opiekun = this.forms.get('imie_nazwisko_opiekuna');
    if (Number(typOsoby) === TypOsoby.UCZEN) {
      klasa?.setValidators(Validators.required);
      klasa?.enable({ emitEvent : false });
      opiekun?.setValidators([Validators.required, Validators.pattern(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/)]);
      opiekun?.enable({ emitEvent : false });
      this.forms.patchValue({ klasa : '', imie_nazwisko_opiekuna : '' }, { emitEvent : false });
    } else if (Number(typOsoby) === TypOsoby.NAUCZYCIEL) {
      klasa?.setValidators(null);
      klasa?.disable({ emitEvent : false });
      opiekun?.setValidators(null);
      opiekun?.disable({ emitEvent : false });
      this.forms.patchValue({ klasa : '', imie_nazwisko_opiekuna : '' }, { emitEvent : false });
    }
  }

  public ngAfterViewInit() : void {
    this.globalInfo.webSocketStatus.subscribe((status) => {
      if (status !== WebSocketStatus.OPEN) return;
      this.globalInfo.activeUser.subscribe((user : (Student & Opiekun) | undefined) => {
        if (!user) return;
        this.user = user;
        if (!isNaN(Number(user.klasa))) {
          this.database.request('zsti.klasa.getById', { id : user.klasa }, 'klasaList').then((klasa) => {
            if (!klasa[0]) {
              console.log('Nie udało się pobrać danych klasy.');
              this.globalInfo.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać danych klasy.');
              return;
            }

            user.klasa = klasa[0].nazwa;
            this.opiekun_id = user.opiekun_id;
            this.globalInfo.setTitle(`${ user.imie } ${ user.nazwisko } - Dane`);
            this.globalInfo.setActiveTab('DANE');
            this.setForm(user);
            this.cdr.detectChanges();
          });
        } else {
          this.setForm(user);
        }
      });
    });
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
