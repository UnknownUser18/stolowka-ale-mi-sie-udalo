import { Component, effect, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonsService, TypOsoby, ZPerson } from '@database/persons.service';
import { faUser, faUserShield, faPaperPlane, faArrowsRotate, faRotateLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { GuardiansService, ZGuardian } from '@database/guardians.service';
import { NotificationsService } from '@services/notifications.service';
import { SwitchComponent } from '@switch';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { TooltipDelayTriggerDirective } from '@tooltips/tooltip-delay-trigger.directive';

@Component({
  selector : 'app-dane',
  imports : [
    FormsModule,
    ReactiveFormsModule,
    SwitchComponent,
    FaIconComponent,
    TooltipComponent,
    TooltipDelayTriggerDirective
  ],
  templateUrl : './dane.component.html',
  styleUrl : './dane.component.scss'
})
export class DaneComponent {
  protected guardian : ZGuardian | null | undefined;


  protected showWindow : boolean = false;

  protected readonly isRefreshing = signal(false);
  protected readonly isSending = signal(false);

  protected readonly namePattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+ [a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
  protected readonly phonePattern = /^\+\d{1,3} \d{9}$/;
  protected readonly TypOsoby = TypOsoby;
  protected readonly Number = Number;

  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faUser = faUser;
  protected readonly faUserShield = faUserShield;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faRotateLeft = faRotateLeft;


  protected forms = new FormGroup({
    imie_nazwisko : new FormControl('', [Validators.required, Validators.pattern(this.namePattern)]),
    klasa : new FormControl<string | null>(null),
    miasto : new FormControl(false, Validators.required),
    typ_osoby : new FormControl<TypOsoby>(TypOsoby.UCZEN, Validators.required),
    imie_nazwisko_opiekuna : new FormControl<string | null>('', Validators.pattern(this.namePattern)),
    telefon : new FormControl<string | null>('', [Validators.required, Validators.pattern(this.phonePattern)]),
    email : new FormControl<string | null>('', [Validators.required, Validators.email]),
    uczeszcza : new FormControl(false, Validators.required),
  });

  constructor(
    private guardiansS : GuardiansService,
    private personsS : PersonsService,
    private notificationsS : NotificationsService) {

    effect(() => {
      this.personsS.personZ();
      this.getData;
      this.updateValidators();
    })
  }

  private setForm(type : TypOsoby, guardian? : ZGuardian | null) : void {
    const person = this.personsS.personZ();
    if (!person) return;

    if (type === TypOsoby.UCZEN) {
      if (!guardian)
        throw new Error('Osoba jest uczniem, ale nie posiada przypisanego opiekuna.');

      this.forms.setValue({
        imie_nazwisko : person.imie + ' ' + person.nazwisko,
        klasa : person.klasa!,
        miasto : !!person.miasto,
        typ_osoby : TypOsoby.UCZEN,
        imie_nazwisko_opiekuna : guardian.imie_opiekuna + ' ' + guardian.nazwisko_opiekuna,
        telefon : `+${ guardian.nr_kierunkowy } ${ guardian.telefon }`,
        email : guardian.email,
        uczeszcza : !!person.uczeszcza,
      });
    } else if (type === TypOsoby.NAUCZYCIEL) {
      this.forms.setValue({
        imie_nazwisko : person.imie + ' ' + person.nazwisko,
        klasa : null,
        miasto : !!person.miasto,
        typ_osoby : TypOsoby.NAUCZYCIEL,
        imie_nazwisko_opiekuna : null,
        telefon : null,
        email : null,
        uczeszcza : !!person.uczeszcza,
      });
    }

    this.forms.markAsPristine();
    this.forms.markAsUntouched();
  }

  private get getData() : void {
    const person = this.personsS.personZ();
    if (!person) {
      this.notificationsS.createErrorNotification('Nie udało się pobrać danych osoby.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      return;
    }

    if (person.opiekun_id) {
      this.guardiansS.getZGuardian(person.id).subscribe((guardian) => {
        if (!guardian)
          this.notificationsS.createErrorNotification('Nie udało się pobrać danych opiekuna.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');

        this.guardian = guardian;
        this.setForm(TypOsoby.UCZEN, guardian);
      });
    } else {
      this.setForm(TypOsoby.NAUCZYCIEL);
      this.guardian = null;
    }
  }


  protected sendChanges() {
    const user = this.personsS.personZ();
    if (!user) return;

    const { imie_nazwisko, klasa, miasto, typ_osoby, imie_nazwisko_opiekuna, telefon, email, uczeszcza } = this.forms.value;
    if (this.forms.invalid) return;
    this.isSending.set(true);

    const guardianData : ZGuardian | null = typ_osoby === TypOsoby.UCZEN ? {
      id_opiekun : user.opiekun_id!,
      imie_opiekuna : imie_nazwisko_opiekuna!.split(' ')[0],
      nazwisko_opiekuna : imie_nazwisko_opiekuna!.split(' ')[1],
      nr_kierunkowy : Number(telefon!.split(' ')[0].replace('+', '')),
      telefon : Number(telefon!.split(' ')[1]),
      email : email!,
    } : null;

    const person : ZPerson = {
      id : user.id,
      imie : imie_nazwisko!.split(' ')[0],
      nazwisko : imie_nazwisko!.split(' ')[1],
      klasa : typ_osoby === TypOsoby.UCZEN ? klasa! : undefined,
      miasto : !!miasto,
      uczeszcza : !!uczeszcza,
      typ_osoby_id : typ_osoby!,
    }

    if (typ_osoby === TypOsoby.UCZEN) {
      if (!guardianData) {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych opiekuna.', 10, 'Nie znaleziono danych opiekuna. To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        this.isSending.set(false);
        return;
      }

      this.guardiansS.updateZGuardian(user.id, guardianData).subscribe((guardian_id) => {
        if (!guardian_id) {
          this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych opiekuna.', 10, 'Jeśli problem będzie się powtarzał, skontaktuj się z administratorem. Problem: brak ID opiekuna.');
          this.isSending.set(false);
          return;
        }

        person.opiekun_id = guardian_id;

        this.personsS.updateZPerson(person).subscribe((success) => {
          if (!success) {
            this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych osoby.', 10, 'Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
            this.isSending.set(false);
            return;
          }

          this.notificationsS.createSuccessNotification('Dane zostały zaktualizowane pomyślnie.', 3);
          this.personsS.personZ.set({ ...user, ...person, opiekun_id : guardian_id });
          this.forms.markAsPristine();
          this.forms.markAsUntouched();
          this.isSending.set(false);
          this.personsS.selectZPerson(person);
          return;
        })
      });
    } else if (typ_osoby === TypOsoby.NAUCZYCIEL) {
      this.personsS.updateZPerson(person).subscribe((success) => {
        if (!success) {
          this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych osoby.', 10, 'Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
          this.isSending.set(false);
          return;
        }

        this.notificationsS.createSuccessNotification('Dane zostały zaktualizowane pomyślnie.', 3);
        this.personsS.personZ.set({ ...user, ...person, opiekun_id : undefined });
        this.forms.markAsPristine();
        this.forms.markAsUntouched();
        this.isSending.set(false);
        this.personsS.selectZPerson(person);
        return;
      });
    }
  };

  protected updateValidators() : void {
    let typ_osoby = this.forms.get('typ_osoby')?.value;
    typ_osoby = typ_osoby !== null && typ_osoby !== undefined ? Number(typ_osoby) : typ_osoby;

    const klasa = this.forms.get('klasa')!;
    const opiekun = this.forms.get('imie_nazwisko_opiekuna')!;
    const telefon = this.forms.get('telefon')!;
    const email = this.forms.get('email')!;
    if (typ_osoby === TypOsoby.UCZEN) {
      const required = Validators.required;
      klasa.setValidators(required);
      opiekun.setValidators([required, Validators.pattern(this.namePattern)]);
      telefon.setValidators([required, Validators.pattern(this.phonePattern)]);
      email.setValidators([required, Validators.email]);
      klasa.enable();
      opiekun.enable();
      telefon.enable();
      email.enable();
    } else if (typ_osoby === TypOsoby.NAUCZYCIEL) {
      klasa.setValidators(null);
      opiekun.setValidators(null);
      telefon.setValidators(null);
      email.setValidators(null);
      telefon.disable();
      email.disable();
      klasa.disable();
      opiekun.disable();
      this.forms.patchValue({ klasa : '', imie_nazwisko_opiekuna : '' });
    }
  }

}
