import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypOsoby, ZPerson } from '@database/persons/persons';

@Component({
  selector : 'app-administracja-osob',
  imports : [
    ReactiveFormsModule
  ],
  templateUrl : './administracja-osob.html',
  styleUrl    : './administracja-osob.scss'
})
export class AdministracjaOsob {
  protected archived_users : ZPerson[] | undefined;

  protected readonly Number = Number;

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

  constructor(
    protected router : Router
  ) {
    // this.infoService.setTitle('Administracja');
    // this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() : void => {
      // TODO: Uncomment when backend is ready and implement the archived users request
      // this.database.request('archived.zsti.get', {}, 'student').then((payload) => {
      //   if (!payload) {
      //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać użytkowników z archiwum.');
      //     return;
      //   } else if (payload.length === 0) {
      //     this.infoService.generateNotification(NotificationType.WARNING, 'Brak użytkowników w archiwum.');
      //   }
      //   this.archived_users = payload;
      // });
    // });

    // this.router.events.subscribe((event : any) => {
    //   if (!(event instanceof NavigationEnd || event instanceof NavigationSkipped)) return;
    //   const url = event.url.replace('/administracja/', '');
    //   switch (url) {
    //     case 'users':
    //       this.infoService.setTitle('Archiwum osób ZSTI - Administracja');
    //       break;
    //     case 'klasy':
    //       this.infoService.setTitle('Klasy - Administracja');
    //       break;
    //     case 'dodaj-osobe':
    //       this.infoService.setTitle('Dodaj osobę - Administracja');
    //       break;
    //   }
    // });
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
    // if (!this.osobaForm.valid) {
    //   this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
    //   return;
    // }
    // const formValue = this.osobaForm.value;
    // let opiekunData = null;
    // let id = null;
    // if (Number(formValue.typ_osoby) === TypOsoby.UCZEN) {
    //   opiekunData = {
    //     imie_opiekuna : formValue.imie_nazwisko_opiekuna?.split(' ')[0],
    //     nazwisko_opiekuna : formValue.imie_nazwisko_opiekuna?.split(' ')[1],
    //     email : formValue.email,
    //     telefon : formValue.telefon,
    //     nr_kierunkowy : formValue.nr_kierunkowy,
    //   }
    // }
    // const data = {
    //   imie : formValue.imie_nazwisko?.split(' ')[0],
    //   nazwisko : formValue.imie_nazwisko?.split(' ')[1],
    //   email : formValue.email,
    //   telefon : formValue.telefon,
    //   nr_kierunkowy : formValue.nr_kierunkowy,
    //   uczeszcza : formValue.uczeszcza,
    //   miasto : formValue.miasto,
    //   klasa : formValue.klasa === '' ? null : formValue.klasa,
    //   typ_osoby_id : Number(formValue.typ_osoby),
    //   opiekun_id : id,
    // };
    // if (Number(formValue.typ_osoby) === TypOsoby.UCZEN) {
    //   TODO: Uncomment when backend is ready and implement the add guardian request
    //   this.database.request('zsti.guardian.add', { ...opiekunData }, 'dump').then((payload) => {
    //     if (!payload) {
    //       this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać opiekuna.');
    //       return;
    //     }
    //     id = (payload as any).insertId
    //     data.opiekun_id = id;
    //
    //     this.database.request('zsti.klasa.getId', { nazwa : data.klasa }, 'dump').then((klasaId) => {
    //       if (!klasaId) {
    //         this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać ID klasy.');
    //         return;
    //       }
    //       data.klasa = klasaId[0].id as string;
    //
    //       this.database.request('zsti.student.add', { ...data }, 'dump').then((payload) => {
    //         if (!payload) {
    //           this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się doda�� ucznia.');
    //           return;
    //         }
    //         this.infoService.generateNotification(NotificationType.SUCCESS, 'Użytkownik został dodany.');
    //       });
    //     });
    //   });
    // } else {
      // TODO: Uncomment when backend is ready and implement the add student request
      // this.database.request('zsti.student.add', { ...data }, 'dump').then((payload) => {
      //   if (!payload) {
      //     this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać użytkownika.');
      //     return;
      //   }
      //   this.infoService.generateNotification(NotificationType.SUCCESS, 'Użytkownik został dodany.');
      // });
    // }
  }
}
