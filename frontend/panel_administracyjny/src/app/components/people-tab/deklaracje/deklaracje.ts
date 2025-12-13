import { Component, computed, effect, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Persons } from '@database/persons/persons';
import { Declarations, ZDeclaration } from '@database/declarations/declarations';
import { Notifications } from '@services/notifications';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendar, faCalendarDay, faFilter, faPaperPlane, faPlus, faRotate, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Checkbox } from '@shared/checkbox/checkbox';
import { Calendar } from '@utils/calendar/calendar';
import { IsSelectedDeclarationPipe } from "@pipes/isSelectedDeclaration/is-selected-declaration.pipe";
import { DialogTriggerDirective } from "@directives/dialog/dialog-trigger.directive";
import { TooltipDelayTriggerDirective } from "@directives/delayTooltip/tooltip-delay-trigger.directive";
import { ButtonDanger, ButtonDefault, ButtonPrimary, ButtonSecondary, ButtonSuccess, Dialog, Fieldset, Input, Label, LabelOneLine, Table, Tooltip } from '@ui';
import { apply, Field, form, required, schema } from "@angular/forms/signals";
import { Info } from "@shared/info";

interface DeclarationForm {
  data_od : string;
  data_do : string;
  pon : boolean;
  wt : boolean;
  sr : boolean;
  czw : boolean;
  pt : boolean;
}


type BinaryDay = '0' | '1';
type DaysBinaryString = `${ BinaryDay }${ BinaryDay }${ BinaryDay }${ BinaryDay }${ BinaryDay }`;

@Component({
  selector  : 'app-deklaracje',
  imports   : [
    ReactiveFormsModule,
    DatePipe,
    FaIconComponent,
    IsSelectedDeclarationPipe,
    Checkbox,
    Calendar,
    Dialog,
    DialogTriggerDirective,
    TooltipDelayTriggerDirective,
    Tooltip,
    ButtonPrimary,
    ButtonSecondary,
    ButtonDefault,
    Table,
    Label,
    Input,
    Fieldset,
    ButtonSuccess,
    ButtonDanger,
    LabelOneLine,
    Field
  ],
  templateUrl : './deklaracje.html',
  styleUrl  : './deklaracje.scss',
  providers : [DatePipe],
})
export class Deklaracje {
  protected declarations = signal<ZDeclaration[] | null>(null);
  protected readonly hasWrongDays = signal(false);
  protected readonly addHasWrongDays = signal(false);
  protected readonly icons = {
    faCalendar,
    faCalendarDay,
    faPaperPlane,
    faTrash,
    faRotate,
    faPlus,
    faFilter,
  };

  protected isLoading = false;
  private deklaracja = signal<DeclarationForm>({
    data_od : '',
    data_do : '',
    pon     : false,
    wt      : false,
    sr      : false,
    czw     : false,
    pt      : false,
  });
  private add = signal<DeclarationForm>({
    data_od : '',
    data_do : '',
    pon     : true,
    wt      : true,
    sr      : true,
    czw     : true,
    pt      : true,
  });
  private filter = signal<DeclarationForm>({
    data_od : '',
    data_do : '',
    pon     : false,
    wt      : false,
    sr      : false,
    czw     : false,
    pt      : false,
  });
  private validators = schema<DeclarationForm>((values) => {
    required(values.data_od, { message : 'Pole jest wymagane.' });
    required(values.data_do, { message : 'Pole jest wymagane.' });
  });

  protected dni = new Map<string, string>([
    ['pon', 'Poniedziałek'],
    ['wt', 'Wtorek'],
    ['sr', 'Środa'],
    ['czw', 'Czwartek'],
    ['pt', 'Piątek'],
  ]);

  protected addDateError = false;
  protected selectedDateError = false;

  protected readonly selectedDeclaration = signal<ZDeclaration | null>(null);
  protected deklaracjaForm = form(this.deklaracja, (schemaPath) => {
    apply(schemaPath, this.validators)
  });
  protected readonly selectedDeclarationComputed = computed(() => {
    const { data_od, data_do, pon, wt, sr, czw, pt } = this.deklaracjaForm().value();

    const dataOd = new Date(data_od);
    const dataDo = new Date(data_do);

    dataOd.setHours(0, 0, 0, 0);
    dataDo.setHours(0, 0, 0, 0);

    if (dataOd > dataDo) {
      this.selectedDateError = true;
      return null;
    }

    this.selectedDateError = false;


    const dni = this.convertDaysToBinary({ pon, wt, sr, czw, pt });

    return {
      ...this.selectedDeclaration(),
      data_od : dataOd,
      data_do : dataDo,
      dni
    } as ZDeclaration | null;
  })
  protected addForm = form(this.add, (schemaPath) => {
    apply(schemaPath, this.validators)
  });
  protected readonly addDeclarationComputed = computed(() => {
    const { data_od, data_do, pon, wt, sr, czw, pt } = this.addForm().value();

    const dataOd = new Date(data_od);
    const dataDo = new Date(data_do);

    dataOd.setHours(0, 0, 0, 0);
    dataDo.setHours(0, 0, 0, 0);

    if (dataOd > dataDo) {
      this.addDateError = true;
      return null;
    }

    this.addDateError = false;

    const dni = this.convertDaysToBinary({ pon, wt, sr, czw, pt });

    return {
      data_od : dataOd,
      data_do : dataDo,
      dni
    } as ZDeclaration | null;
  });
  protected filterForm = form(this.filter, (schemaPath) => {
    apply(schemaPath, this.validators)
  });
  protected shownDeclarations = computed(() => {
    this.filterForm();
    return this.getFilteredDeclarations;
  });
  protected readonly Array = Array;

  constructor(
    private declarationsS : Declarations,
    private notificationsS : Notifications,
    private datePipe : DatePipe,
    protected personS : Persons,
  ) {
    let previousSelectedDeclaration : ZDeclaration | null = null;

    effect(() => {
      this.personS.personZ();
      this.refreshDeclarations();
    });

    effect(() => {
      const declaration = this.selectedDeclaration();
      if (declaration === previousSelectedDeclaration) return;
      previousSelectedDeclaration = declaration;

      if (!declaration) return;

      this.patchForm(declaration);
    });
  }

  private get getFilteredDeclarations() {
    const declarations = this.declarations() ?? [];
    const filterValues = this.filterForm().value();

    return declarations.filter(declaration => {
      const dataOd = new Date(filterValues.data_od);
      dataOd.setHours(0, 0, 0, 0);
      const dataDo = new Date(filterValues.data_do);
      dataDo.setHours(0, 0, 0, 0);

      if (declaration.data_do < dataOd || declaration.data_od > dataDo) {
        return false;
      }

      const days = [
        filterValues.pon,
        filterValues.wt,
        filterValues.sr,
        filterValues.czw,
        filterValues.pt,
      ];

      for (let i = 0 ; i < days.length ; i++) {
        if (days[i] && declaration.dni.charAt(i) === '1') {
          return true;
        }
      }

      return !days.includes(true);
    })
  }

  private get getData() {
    const id = this.personS.personZ()?.id;

    if (!id) return;

    this.declarationsS.getZDeclarationsPerson(id).subscribe((declarations) => {
      if (!declarations)
        this.notificationsS.createErrorNotification('Nie udało się pobrać deklaracji.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      else if (declarations.length === 0)
        this.notificationsS.createWarningNotification('Brak deklaracji dla tej osoby.', 5);
      else
        this.notificationsS.createSuccessNotification('Pomyślnie pobrano deklaracje.');
      this.declarations.set(declarations);
      this.isLoading = false;
    });
  }

  protected getFieldFromDay(day : string, formType : 'add' | 'declaration' | 'filter') {
    const form = formType === 'add' ? this.addForm : formType === 'declaration' ? this.deklaracjaForm : this.filterForm;
    switch (day) {
      case 'pon':
        return form.pon;
      case 'wt':
        return form.wt;
      case 'sr':
        return form.sr;
      case 'czw':
        return form.czw;
      case 'pt':
        return form.pt;
      default:
        throw new Error('Invalid day');
    }
  }

  protected addDeclarationToDB() {

    const personId = this.personS.personZ()?.id;
    if (!personId) {
      this.notificationsS.createErrorNotification('Nie znaleziono osoby, do której ma zostać dodana deklaracja.', 10, Info.CONTACT_ADMIN);
      return;
    }

    const { data_od, data_do, dni } = this.addDeclarationComputed()!;

    const newDeclaration : Omit<ZDeclaration, 'id'> = {
      id_osoby : personId,
      data_od,
      data_do,
      dni,
    };

    this.declarationsS.addZDeclaration(newDeclaration).subscribe((result) => {
      if (!result) {
        this.notificationsS.createErrorNotification('Nie udało się dodać deklaracji.', 10, Info.CONTACT_ADMIN);
        return;
      }
      this.notificationsS.createSuccessNotification('Pomyślnie dodano deklarację.', 5);
      const newDeclarationWithId : ZDeclaration = { ...newDeclaration, id : result };

      this.declarations.update((currentDeclarations) => {
        return [
          ...(currentDeclarations ?? []),
          newDeclarationWithId
        ];
      });

      this.addForm().reset({
        data_od : '',
        data_do : '',
        pon     : false,
        wt      : false,
        sr      : false,
        czw     : false,
        pt      : false,
      });
    });
  }

  private isValidDay(index : number, declaration : ZDeclaration | null) {
    if (!declaration?.dni) return false;
    if (index < 0 || index > 4) return false;
    return declaration?.dni.charAt(index) === '1';
  }

  protected updateDeclaration() {
    if (this.deklaracjaForm().invalid())
      return;

    const { data_od, data_do, pon, wt, sr, czw, pt } = this.deklaracjaForm().value();
    if (!data_od || !data_do) return;

    let data_odD = new Date(data_od);
    let data_doD = new Date(data_do);
    data_odD.setHours(0, 0, 0, 0);
    data_doD.setHours(0, 0, 0, 0);

    const dni = this.convertDaysToBinary({ pon, wt, sr, czw, pt });

    const sDeclaration = this.selectedDeclaration();
    if (!sDeclaration) return;

    if (sDeclaration.dni === dni && sDeclaration.data_od === data_odD && sDeclaration.data_do === data_doD) {
      this.notificationsS.createInfoNotification('Brak zmian do zapisania.');
      return;
    }

    const updatedDeclaration : ZDeclaration = {
      ...sDeclaration,
      data_od : data_odD,
      data_do : data_doD,
      dni : dni,
    };

    this.declarationsS.updateZDeclaration(updatedDeclaration).subscribe((result) => {
      if (result) {
        this.notificationsS.createSuccessNotification('Pomyślnie zaktualizowano deklarację.', 5);
        const index = this.declarations()?.findIndex(d => d.id === updatedDeclaration.id) ?? -1;
        if (index !== -1 && this.declarations()) {
          this.declarations()![index] = updatedDeclaration;
        }
        this.selectedDeclaration.set(updatedDeclaration);
        this.refreshDeclarations();
      } else {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować deklaracji.', 10, Info.CONTACT_ADMIN);
      }
    })
  }

  protected resetDeclaration() {
    const declaration = this.selectedDeclaration();
    if (!declaration) return;
    this.patchForm(declaration);
  }

  protected deleteDeclaration() {
    const declaration = this.selectedDeclaration();
    if (!declaration) return;

    this.declarationsS.deleteZDeclaration(declaration.id).subscribe((result) => {
      if (result) {
        this.notificationsS.createSuccessNotification('Pomyślnie usunięto deklarację.', 5);
        this.declarations.set(this.declarations()?.filter(d => d.id !== declaration.id) || null);
        this.selectedDeclaration.set(null);
      } else {
        this.notificationsS.createErrorNotification('Nie udało się usunąć deklaracji.', 10, Info.CONTACT_ADMIN);
      }
    });
  }

  protected resetFilter() {
    this.filterForm().reset({
      data_od : '',
      data_do : '',
      pon     : false,
      wt      : false,
      sr      : false,
      czw     : false,
      pt      : false,
    });
  }

  private convertDaysToBinary({ pon, wt, sr, czw, pt } : Omit<DeclarationForm, 'data_od' | 'data_do'>) : DaysBinaryString {
    return `${ pon ? '1' : '0' }${ wt ? '1' : '0' }${ sr ? '1' : '0' }${ czw ? '1' : '0' }${ pt ? '1' : '0' }` as DaysBinaryString;
  }

  private patchForm(declaration : ZDeclaration) {
    this.deklaracjaForm().setControlValue({
      data_od : this.datePipe.transform(declaration.data_od, 'yyyy-MM-dd') ?? '',
      data_do : this.datePipe.transform(declaration.data_do, 'yyyy-MM-dd') ?? '',
      pon     : this.isValidDay(0, declaration),
      wt      : this.isValidDay(1, declaration),
      sr      : this.isValidDay(2, declaration),
      czw     : this.isValidDay(3, declaration),
      pt      : this.isValidDay(4, declaration),
    });
  }

  protected refreshDeclarations() {
    this.isLoading = true;
    this.getData;
  }
}
