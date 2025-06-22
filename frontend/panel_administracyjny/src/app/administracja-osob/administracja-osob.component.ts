import { ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { DataService, Student, TypOsoby } from '../services/data.service';
import { VariablesService } from '../services/variables.service';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';
import { TransitionService } from '../services/transition.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector : 'app-administracja-osob',
  imports : [
    ReactiveFormsModule
  ],
  templateUrl : './administracja-osob.component.html',
  styleUrl : './administracja-osob.component.scss'
})
export class AdministracjaOsobComponent {
  protected showWindow : '' | 'restore' | 'add' | 'delete' = '';
  protected archived_users : Student[] | undefined;

  protected readonly TypOsoby = TypOsoby;
  protected readonly Number = Number;
  protected selectedUser : Student | undefined;

  protected osobaForm = new FormGroup({
    imie_nazwisko : new FormControl('', [
      Validators.required,
    ]),
    email : new FormControl('', [Validators.required, Validators.email]),
    telefon : new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]),
    nr_kierunkowy : new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d+$/)]),
    uczeszcza : new FormControl(1, Validators.required),
    miasto : new FormControl(0, Validators.required),
    klasa : new FormControl(''),
    typ_osoby : new FormControl(TypOsoby.UCZEN, Validators.required),
    imie_nazwisko_opiekuna : new FormControl('')
  });

  @ViewChild('table') table! : ElementRef;
  @ViewChild('window') window_element! : ElementRef;

  constructor(
    private variables : VariablesService,
    private database : DataService,
    private infoService : GlobalInfoService,
    private transition : TransitionService,
    private zone : NgZone,
    private cdr : ChangeDetectorRef,
    protected router : Router
  ) {
    this.infoService.setTitle('Administracja');
    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() : void => {
      this.database.request('archived.zsti.get', {}, 'student').then((payload) => {
        if (!payload) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać użytkowników z archiwum.');
          return;
        } else if (payload.length === 0) {
          this.infoService.generateNotification(NotificationType.WARNING, 'Brak użytkowników w archiwum.');
        }
        this.archived_users = payload;
      });
    });

    this.router.events.subscribe((event : any) => {
      if (!(event instanceof NavigationEnd || event instanceof NavigationSkipped)) return;
      const url = event.url.replace('/administracja/', '');
      switch (url) {
        case 'users':
          this.infoService.setTitle('Archiwum osób ZSTI - Administracja');
          break;
        case 'klasy':
          this.infoService.setTitle('Klasy - Administracja');
          break;
        case 'dodaj-osobe':
          this.infoService.setTitle('Dodaj osobę - Administracja');
          break;
      }
    });
  }

  protected closeWindow() : void {
    this.transition.applyAnimation(this.window_element.nativeElement, false, this.zone).then(() => {
      this.showWindow = '';
    });
  }

  protected openWindow(type : '' | 'restore' | 'add' | 'delete') : void {
    this.showWindow = type;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.window_element.nativeElement, true, this.zone).then();
  }

  protected restoreUser() : void {
    this.database.request('archived.zsti.delete', { id : this.selectedUser?.id }, 'student').then((payload) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się przywrócić użytkownika.');
        return;
      }
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Użytkownik został przywrócony.');
      this.archived_users = this.archived_users?.filter((user) => user.id !== this.selectedUser?.id);
      this.closeWindow();
    });
  }

  protected openUser(id : number) {
    this.selectedUser = this.archived_users?.find((user) => user.id === id);
    this.openWindow('restore')
  }

  protected onTypOsobyChange() : void {
    const klasa = this.osobaForm.get('klasa');
    const opiekun = this.osobaForm.get('imie_nazwisko_opiekuna');
    if (Number(this.osobaForm.get('typ_osoby')?.value) === TypOsoby.NAUCZYCIEL) {
      klasa?.disable();
      opiekun?.disable();
      opiekun?.setValue('');
      klasa?.setValue('');
    } else {
      klasa?.enable();
      opiekun?.enable();
      opiekun?.setValidators(Validators.pattern(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+ [A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+$/));
      opiekun?.updateValueAndValidity();
    }
  }

  protected sendChanges() : void {
    if (!this.osobaForm.valid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.osobaForm.value;
    let opiekunData = null;
    let id = null;
    if (Number(formValue.typ_osoby) === TypOsoby.UCZEN) {
      opiekunData = {
        imie_opiekuna : formValue.imie_nazwisko_opiekuna?.split(' ')[0],
        nazwisko_opiekuna : formValue.imie_nazwisko_opiekuna?.split(' ')[1],
        email : formValue.email,
        telefon : formValue.telefon,
        nr_kierunkowy : formValue.nr_kierunkowy,
      }
    }
    const data = {
      imie : formValue.imie_nazwisko?.split(' ')[0],
      nazwisko : formValue.imie_nazwisko?.split(' ')[1],
      email : formValue.email,
      telefon : formValue.telefon,
      nr_kierunkowy : formValue.nr_kierunkowy,
      uczeszcza : formValue.uczeszcza,
      miasto : formValue.miasto,
      klasa : formValue.klasa === '' ? null : formValue.klasa,
      typ_osoby_id : Number(formValue.typ_osoby),
      opiekun_id : id,
    };
    if (Number(formValue.typ_osoby) === TypOsoby.UCZEN) {
      this.database.request('zsti.guardian.add', { ...opiekunData }, 'dump').then((payload) => {
        if (!payload) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać opiekuna.');
          return;
        }
        id = (payload as any).insertId
        data.opiekun_id = id;

        this.database.request('zsti.klasa.getId', { nazwa : data.klasa }, 'dump').then((klasaId) => {
          if (!klasaId) {
            this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać ID klasy.');
            return;
          }
          data.klasa = klasaId[0].id as string;

          this.database.request('zsti.student.add', { ...data }, 'dump').then((payload) => {
            if (!payload) {
              this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się doda�� ucznia.');
              return;
            }
            this.infoService.generateNotification(NotificationType.SUCCESS, 'Użytkownik został dodany.');
          });
        });
      });
    } else {
      this.database.request('zsti.student.add', { ...data }, 'dump').then((payload) => {
        if (!payload) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać użytkownika.');
          return;
        }
        this.infoService.generateNotification(NotificationType.SUCCESS, 'Użytkownik został dodany.');
      });
    }
  }
}
