import { ChangeDetectorRef, Component, effect, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PersonsService } from '@database/persons.service';
import { DeclarationsService, ZDeclaration } from '@database/declarations.service';
import { NotificationsService } from '@services/notifications.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendar, faCalendarDay, faPaperPlane, faTrash, faRotate, faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';
import { CheckboxComponent } from '@checkbox';
import { CalendarComponent } from '@calendar';
import { IsSelectedDeclarationPipe } from "@pipes/is-selected-declaration.pipe";
import { DialogComponent } from "@tooltips/dialog/dialog.component";
import { DialogTriggerDirective } from "@tooltips/dialog-trigger.directive";
import { TooltipComponent } from "@tooltips/tooltip/tooltip.component";
import { TooltipDelayTriggerDirective } from "@tooltips/tooltip-delay-trigger.directive";

@Component({
  selector : 'app-deklaracje',
  imports : [
    ReactiveFormsModule,
    DatePipe,
    FaIconComponent,
    IsSelectedDeclarationPipe,
    CheckboxComponent,
    CalendarComponent,
    DialogComponent,
    DialogTriggerDirective,
    TooltipDelayTriggerDirective,
    TooltipComponent
  ],
  templateUrl : './deklaracje.component.html',
  styleUrl : './deklaracje.component.scss',
  providers : [DatePipe],
})
export class DeklaracjeComponent {
  protected isLoading = false;
  protected declarations : ZDeclaration[] | null | undefined;
  protected shownDeclarations : ZDeclaration[] | null | undefined;

  protected dni = new Map<string, string>([
    ['pon', 'Poniedziałek'],
    ['wt', 'Wtorek'],
    ['sr', 'Środa'],
    ['czw', 'Czwartek'],
    ['pt', 'Piątek'],
  ]);

  protected addDateError = false;
  protected selectedDateError = false;

  protected deleteDialog = viewChild.required<DialogComponent>('deleteDeclarationDialog');
  protected filterDialog = viewChild.required<DialogComponent>('filterDeclarationsDialog');

  protected readonly selectedDeclaration = signal<ZDeclaration | null>(null);
  protected readonly tempSelectedDeclaration = signal<ZDeclaration | null>(null);
  protected readonly dbDeclarations = signal<ZDeclaration[] | null>(null);
  protected readonly addDeclaration = signal<ZDeclaration | null>(null);

  protected deklaracjaForm = new FormGroup({
    data_od : new FormControl<string | null>(null, Validators.required),
    data_do : new FormControl<string | null>(null, Validators.required),
    pon : new FormControl(true),
    wt : new FormControl(true),
    sr : new FormControl(true),
    czw : new FormControl(true),
    pt : new FormControl(true),
  });
  protected addForm = new FormGroup({
    data_od : new FormControl<string | null>(null, Validators.required),
    data_do : new FormControl<string | null>(null, Validators.required),
    pon : new FormControl(true),
    wt : new FormControl(true),
    sr : new FormControl(true),
    czw : new FormControl(true),
    pt : new FormControl(true),
  });
  protected filterForm = new FormGroup({
    data_od : new FormControl<string | null>(null),
    data_do : new FormControl<string | null>(null),
    pon : new FormControl(true),
    wt : new FormControl(true),
    sr : new FormControl(true),
    czw : new FormControl(true),
    pt : new FormControl(true),
  });

  protected readonly faCalendar = faCalendar;
  protected readonly faCalendarDay = faCalendarDay;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faTrash = faTrash;
  protected readonly faRotate = faRotate;
  protected readonly faPlus = faPlus;
  protected readonly faFilter = faFilter

  protected readonly Array = Array;


  constructor(
    private declarationsS : DeclarationsService,
    private notificationsS : NotificationsService,
    private cdr : ChangeDetectorRef,
    private datePipe : DatePipe,
    protected personS : PersonsService,
  ) {

    effect(() => {
      this.personS.personZ();
      this.refreshDeclarations();
    });

    effect(() => {
      this.selectedDeclaration();

      const declaration = this.selectedDeclaration();
      this.tempSelectedDeclaration.set(declaration ? { ...declaration } : null);

      this.dbDeclarations.set(this.declarations!)
      if (!declaration) return;

      this.patchForm(declaration);
    });
  }

  private patchForm(declaration : ZDeclaration) {
    this.deklaracjaForm.patchValue({
      data_od : this.datePipe.transform(declaration.data_od, 'yyyy-MM-dd') ?? null,
      data_do : this.datePipe.transform(declaration.data_do, 'yyyy-MM-dd') ?? null,
      pon : this.isValidDay(0, declaration),
      wt : this.isValidDay(1, declaration),
      sr : this.isValidDay(2, declaration),
      czw : this.isValidDay(3, declaration),
      pt : this.isValidDay(4, declaration),
    });
  }

  private isValidDay(index : number, declaration : ZDeclaration | null) {
    if (!declaration?.dni) return false;
    if (index < 0 || index > 4) return false;
    return declaration?.dni.charAt(index) === '1';
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
      this.shownDeclarations = this.declarations = declarations;
      this.dbDeclarations.set(declarations);
      this.isLoading = false;
    });
  }

  protected updateSelectedDeclaration() {
    const formValue = this.deklaracjaForm.value;
    const data_odV = formValue.data_od ?? null;
    const data_doV = formValue.data_do ?? null;
    let data_od = data_odV ? new Date(data_odV) : null;
    let data_do = data_doV ? new Date(data_doV) : null;

    data_od?.setHours(0, 0, 0, 0);
    data_do?.setHours(0, 0, 0, 0);
    if (!this.tempSelectedDeclaration()) return;

    if (data_od && data_do && data_od > data_do) {
      this.selectedDateError = true;
      return;
    }

    this.selectedDateError = false;

    this.tempSelectedDeclaration.set({
      ...this.tempSelectedDeclaration(),
      data_od,
      data_do
    } as ZDeclaration);


    const current = this.dbDeclarations()!;
    const newDeclarations = current?.filter(d => d.id !== this.tempSelectedDeclaration()!.id) || [];
    newDeclarations.push(this.tempSelectedDeclaration()!);
    this.dbDeclarations.set(newDeclarations);
  }

  protected resetDeclaration() {
    const declaration = this.selectedDeclaration();
    if (!declaration) return;
    this.patchForm(declaration);
  }

  protected updateDeclaration() {
    if (this.deklaracjaForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy.', 5);
      return;
    }

    const { data_od, data_do, pon, wt, sr, czw, pt } = this.deklaracjaForm.value;
    if (!data_od || !data_do) return;

    let data_odD = new Date(data_od);
    let data_doD = new Date(data_do);
    data_odD.setHours(0, 0, 0, 0);
    data_doD.setHours(0, 0, 0, 0);

    const dni = `${ pon ? '1' : '0' }${ wt ? '1' : '0' }${ sr ? '1' : '0' }${ czw ? '1' : '0' }${ pt ? '1' : '0' }` as `${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }`;

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
        const index = this.declarations?.findIndex(d => d.id === updatedDeclaration.id) ?? -1;
        if (index !== -1 && this.declarations) {
          this.declarations[index] = updatedDeclaration;
          this.dbDeclarations.set(this.declarations);
        }
        this.selectedDeclaration.set(updatedDeclaration);
      } else {
        this.notificationsS.createErrorNotification('Nie udało się zaktualizować deklaracji.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      }
    })
  }

  protected deleteDeclaration() {
    this.deleteDialog().hide();

    const declaration = this.selectedDeclaration();
    if (!declaration) return;

    this.declarationsS.deleteZDeclaration(declaration.id).subscribe((result) => {
      if (result) {
        this.notificationsS.createSuccessNotification('Pomyślnie usunięto deklarację.', 5);
        this.declarations = this.declarations?.filter(d => d.id !== declaration.id) || null;
        this.dbDeclarations.set(this.declarations);
        this.selectedDeclaration.set(null);
      } else {
        this.notificationsS.createErrorNotification('Nie udało się usunąć deklaracji.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      }
    });
  }

  protected addDeclarationToDB() {
    if (this.addForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy.', 5);
      return;
    }

    const { data_od, data_do, pon, wt, sr, czw, pt } = this.addForm.value;
    if (!data_od || !data_do) return;

    let data_odD = new Date(data_od);
    let data_doD = new Date(data_do);
    data_odD.setHours(0, 0, 0, 0);
    data_doD.setHours(0, 0, 0, 0);

    if (data_odD > data_doD) {
      this.notificationsS.createErrorNotification('Data "od" nie może być późniejsza niż data "do".', 5);
      return;
    }

    const dni = `${ pon ? '1' : '0' }${ wt ? '1' : '0' }${ sr ? '1' : '0' }${ czw ? '1' : '0' }${ pt ? '1' : '0' }` as `${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }${ '0' | '1' }`;

    const personId = this.personS.personZ()?.id;
    if (!personId) {
      this.notificationsS.createErrorNotification('Nie znaleziono osoby, do której ma zostać dodana deklaracja.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      return;
    }

    const newDeclaration : Omit<ZDeclaration, 'id'> = {
      id_osoby : personId,
      data_od : data_odD,
      data_do : data_doD,
      dni : dni,
    };

    this.declarationsS.addZDeclaration(newDeclaration).subscribe((result) => {
      if (!result) {
        this.notificationsS.createErrorNotification('Nie udało się dodać deklaracji.', 10, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
        return;
      }
      this.notificationsS.createSuccessNotification('Pomyślnie dodano deklarację.', 5);
      const newDeclarationWithId : ZDeclaration = { ...newDeclaration, id : result };
      this.declarations = [
        ...(this.declarations ?? []),
        newDeclarationWithId
      ];
      this.dbDeclarations.set(this.declarations);
      this.addForm.reset({
        data_od : null,
        data_do : null,
        pon : true,
        wt : true,
        sr : true,
        czw : true,
        pt : true,
      });
      this.addDeclaration.set(null);
    });
  }

  protected isWrong(event : boolean, forForm : 'add' | 'edit') {
    const dataOd = forForm === 'edit' ? this.deklaracjaForm.get('data_od') : this.addForm.get('data_od');
    const dataDo = forForm === 'edit' ? this.deklaracjaForm.get('data_do') : this.addForm.get('data_do');

    dataOd?.setErrors(event ? { incorrect : true } : null);
    dataDo?.setErrors(event ? { incorrect : true } : null);
  }

  protected updateFieldsetAndCalendar() {
    const { data_od, data_do } = this.addForm.value;

    if (!data_od || !data_do) return;
    const declarations = this.declarations!;

    let dataOd = new Date(data_od);
    let dataDo = new Date(data_do);

    dataOd.setHours(0, 0, 0, 0);
    dataDo.setHours(0, 0, 0, 0);

    if (dataOd > dataDo) {
      this.addDateError = true;
      this.addDeclaration.set(null);
    } else {
      this.addDateError = false;
      this.addDeclaration.set({
        data_od : dataOd,
        data_do : dataDo,
      } as ZDeclaration);
      this.cdr.detectChanges();
      this.declarations = declarations;
    }
  }

  protected applyFilter() {
    const { data_od, data_do, pon, wt, sr, czw, pt } = this.filterForm.value;

    let filtered = this.declarations ?? [];

    if (data_od) {
      let dataOd = new Date(data_od);
      dataOd.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => d.data_do >= dataOd!);
    }

    if (data_do) {
      let dataDo = new Date(data_do);
      dataDo.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => d.data_od <= dataDo!);
    }

    const days = [
      pon ? '1' : '0',
      wt ? '1' : '0',
      sr ? '1' : '0',
      czw ? '1' : '0',
      pt ? '1' : '0',
    ].join('');

    if (days !== '11111') {
      filtered = filtered.filter(d => {
        for (let i = 0 ; i < 5 ; i++) {
          if (days.charAt(i) === '1' && d.dni.charAt(i) === '1') {
            return true;
          }
        }
        return false;
      });
    }

    this.shownDeclarations = filtered;
    this.filterDialog().hide();
  }

  protected resetFilter() {
    this.filterForm.reset({
      data_od : null,
      data_do : null,
      pon : true,
      wt : true,
      sr : true,
      czw : true,
      pt : true,
    });
    this.shownDeclarations = this.declarations;
  }

  protected refreshDeclarations() {
    this.isLoading = true;
    this.getData;
  }
}
