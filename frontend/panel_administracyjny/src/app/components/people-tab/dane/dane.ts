import { Component, effect, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Persons, TypOsoby, ZPerson } from '@database/persons/persons';
import { faArrowsRotate, faCircleInfo, faPaperPlane, faRotateLeft, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Guardians, ZGuardian } from '@database/guardians/guardians';
import { Notifications } from '@services/notifications';
import { ButtonDanger, ButtonPrimary, ButtonSecondary, Fieldset, Input, Label, LabelOneLine, Switch } from '@ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Tooltip } from '@utils/tooltip/tooltip';
import { TooltipDelayTriggerDirective } from '@directives/delayTooltip/tooltip-delay-trigger.directive';
import { disabled, Field, FieldTree, form, PathKind, pattern, required, SchemaPath } from "@angular/forms/signals";
import { State } from "@shared/switch/switch";
import Child = PathKind.Child;

type TypOsobyString = `${ TypOsoby }`;

interface ZPersonForm {
  imie_nazwisko : string;
  klasa : string | null;
  miasto : State;
  typ_osoby : TypOsobyString;
  imie_nazwisko_opiekuna : string | null;
  telefon : string | null;
  email : string | null;
  uczeszcza : State;
}

@Component({
  selector : 'app-dane',
  imports  : [
    FormsModule,
    ReactiveFormsModule,
    Switch,
    FaIconComponent,
    Tooltip,
    TooltipDelayTriggerDirective,
    Fieldset,
    Label,
    Input,
    LabelOneLine,
    ButtonSecondary,
    ButtonPrimary,
    ButtonDanger,
    Field,
  ],
  templateUrl : './dane.html',
  styleUrl : './dane.scss'
})
export class Dane {
  protected readonly icons = {
    faCircleInfo,
    faUser,
    faUserShield,
    faPaperPlane,
    faArrowsRotate,
    faRotateLeft,
  }
  private readonly namePattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+ [a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
  private readonly phonePattern = /^\+\d{1,3} \d{9}$/;

  protected guardian : ZGuardian | null | undefined;
  protected readonly isRefreshing = signal(false);
  protected readonly isSending = signal(false);

  protected readonly TypOsoby = TypOsoby;
  protected readonly Number = Number;
  private ZPersonSignal = signal<ZPersonForm>({
    imie_nazwisko          : '',
    klasa                  : null,
    miasto                 : 'off',
    typ_osoby              : `${ TypOsoby.UCZEN }`,
    imie_nazwisko_opiekuna : null,
    telefon                : null,
    email                  : null,
    uczeszcza              : 'off',
  });
  protected ZPersonForm = form(this.ZPersonSignal, (schemaPath) => {
    required(schemaPath.imie_nazwisko, { message : 'Imię i nazwisko jest wymagane.' });
    pattern(schemaPath.imie_nazwisko, this.namePattern, { message : 'Imię i nazwisko musi zawierać imię i nazwisko oddzielone spacją, składające się tylko z liter.' });

    required(schemaPath.klasa, {
      message : 'Klasa jest wymagana.',
      when    : ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.UCZEN
    });
    disabled(schemaPath.klasa, ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.NAUCZYCIEL);

    required(schemaPath.miasto, { message : 'Pole "Czy jest opłacane przez miasto" jest wymagane.' });

    required(schemaPath.typ_osoby, { message : 'Typ osoby jest wymagany.' });

    required(schemaPath.imie_nazwisko_opiekuna, {
      message : 'Imię i nazwisko opiekuna jest wymagane.',
      when    : ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.UCZEN
    });
    pattern(schemaPath.imie_nazwisko_opiekuna as SchemaPath<string, 1, Child>, this.namePattern, { message : 'Imię i nazwisko opiekuna musi zawierać imię i nazwisko oddzielone spacją, składające się tylko z liter.', });
    disabled(schemaPath.imie_nazwisko_opiekuna, ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.NAUCZYCIEL);

    required(schemaPath.telefon, {
      message : 'Telefon jest wymagany.',
      when    : ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.UCZEN
    });
    pattern(schemaPath.telefon as SchemaPath<string, 1, Child>, this.phonePattern, { message : 'Telefon musi być w formacie +XXX XXXXXXXXX.', });
    disabled(schemaPath.telefon, ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.NAUCZYCIEL);

    required(schemaPath.email, {
      message : 'Email jest wymagany.',
      when    : ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.UCZEN
    });

    disabled(schemaPath.email, ({ valueOf }) => this.toTypOsoby(valueOf(schemaPath.typ_osoby)) === TypOsoby.NAUCZYCIEL);

    required(schemaPath.uczeszcza, { message : 'Pole "Czy uczęszcza" jest wymagane.' });
  })

  constructor(
    private guardiansS : Guardians,
    private personsS : Persons,
    private notificationsS : Notifications) {

    effect(() => {
      this.personsS.personZ();
      this.getData;
    });
  }

  /**
   * @deprecated Temporary workaround for a typing issue. Remove when fixed in Angular.
   */
  //! Temporary workaround for a typing issue. Remove when fixed in Angular.
  protected asStringField(value : any) {
    return value as FieldTree<string, string>;
  }

  protected sendChanges() {
    const user = this.personsS.personZ();
    if (!user) return;

    const { imie_nazwisko, klasa, miasto, typ_osoby, imie_nazwisko_opiekuna, telefon, email, uczeszcza } = this.ZPersonForm().value();
    const typOsobyValue = this.toTypOsoby(typ_osoby);
    if (this.ZPersonForm().invalid()) return;
    this.isSending.set(true);

    const guardianData : ZGuardian | null = typOsobyValue === TypOsoby.UCZEN ? {
      id_opiekun    : user.opiekun_id!,
      imie_opiekuna : imie_nazwisko_opiekuna!.split(' ')[0],
      nazwisko_opiekuna : imie_nazwisko_opiekuna!.split(' ')[1],
      nr_kierunkowy : Number(telefon!.split(' ')[0].replace('+', '')),
      telefon       : Number(telefon!.split(' ')[1]),
      email         : email!,
    } : null;

    const person : ZPerson = {
      id           : user.id,
      imie         : imie_nazwisko.split(' ')[0],
      nazwisko     : imie_nazwisko.split(' ')[1],
      klasa        : typOsobyValue === TypOsoby.UCZEN ? klasa! : undefined,
      miasto       : miasto === 'on',
      uczeszcza    : uczeszcza === 'on',
      typ_osoby_id : typOsobyValue,
    }

    if (typOsobyValue === TypOsoby.UCZEN) {
      if (!guardianData) {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych opiekuna.', 10, 'Nie znaleziono danych opiekuna. To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        this.isSending.set(false);
        return;
      }

      this.guardiansS.updateZGuardian(user.id, guardianData).subscribe((guardian_id) => {
        if (!guardian_id) {
          this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych opiekuna.', 10, 'Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
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
          this.ZPersonForm().reset();
          this.isSending.set(false);
          this.personsS.selectZPerson(person);
          return;
        })
      });
    } else if (typOsobyValue === TypOsoby.NAUCZYCIEL) {
      this.personsS.updateZPerson(person).subscribe((success) => {
        if (!success) {
          this.notificationsS.createErrorNotification('Nie udało się zaktualizować danych osoby.', 10, 'Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
          this.isSending.set(false);
          return;
        }

        this.notificationsS.createSuccessNotification('Dane zostały zaktualizowane pomyślnie.', 3);
        this.personsS.personZ.set({ ...user, ...person, opiekun_id : undefined });
        this.ZPersonForm().reset();
        this.isSending.set(false);
        this.personsS.selectZPerson(person);
        return;
      });
    }
  }

  protected updateOnTypOsobyChange() {
    const typ_osoby = this.ZPersonForm.typ_osoby().value();
    const typOsobyValue = this.toTypOsoby(typ_osoby);

    if (typOsobyValue === TypOsoby.UCZEN) {
      this.setForm(TypOsoby.UCZEN, this.guardian ?? undefined);
    } else if (typOsobyValue === TypOsoby.NAUCZYCIEL) {
      this.setForm(TypOsoby.NAUCZYCIEL);
    }
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

  private setForm(type : TypOsoby, guardian? : ZGuardian | null) : void {
    const person = this.personsS.personZ();
    if (!person) return;

    this.ZPersonForm().reset();

    const { imie, nazwisko, klasa, miasto, uczeszcza } = person;

    if (type === TypOsoby.UCZEN) {
      if (!guardian)
        throw new Error('Osoba jest uczniem, ale nie posiada przypisanego opiekuna.');

      const { imie_opiekuna, nazwisko_opiekuna, nr_kierunkowy, telefon, email } = guardian;

      this.ZPersonForm().setControlValue({
        imie_nazwisko          : `${ imie } ${ nazwisko }`,
        klasa                  : klasa!,
        miasto                 : miasto ? 'on' : 'off',
        typ_osoby              : `${ type }`,
        imie_nazwisko_opiekuna : `${ imie_opiekuna } ${ nazwisko_opiekuna }`,
        telefon                : `+${ nr_kierunkowy } ${ telefon }`,
        email                  : email,
        uczeszcza              : uczeszcza ? 'on' : 'off',
      });
    } else if (type === TypOsoby.NAUCZYCIEL) {
      this.ZPersonForm().setControlValue({
        imie_nazwisko : `${ imie } ${ nazwisko }`,
        klasa         : null,
        miasto        : miasto ? 'on' : 'off',
        typ_osoby     : `${ type }`,
        imie_nazwisko_opiekuna : null,
        telefon       : null,
        email         : null,
        uczeszcza     : uczeszcza ? 'on' : 'off',
      });
    }
  }

  /**
   * @deprecated Temporary workaround for a typing issue. Remove when fixed in Angular.
   */
  //! Temporary workaround for a typing issue. Remove when fixed in Angular.
  private toTypOsoby(value : TypOsobyString | TypOsoby) : TypOsoby {
    return typeof value === 'number' ? value : Number(value) as TypOsoby;
  }
}
