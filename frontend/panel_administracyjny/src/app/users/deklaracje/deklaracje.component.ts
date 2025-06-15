import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService, Declaration } from '../../services/data.service';
import { GlobalInfoService, NotificationType } from '../../services/global-info.service';
import { TransitionService } from '../../services/transition.service';
import { wynikString } from '../zsti/zsti.component';
import { takeUntil, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { VariablesService } from '../../services/variables.service';

@Component({
  selector : 'app-deklaracje',
  imports : [
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl : './deklaracje.component.html',
  styleUrl : './deklaracje.component.scss',
  providers : [DatePipe],
})
export class DeklaracjeComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private invalidDates : Date[] = [];
  private id : number = 0;
  private user_id : number = 0;

  protected dniNazwy = [
    { key : 'poniedzialek', label : 'Poniedziałek' },
    { key : 'wtorek', label : 'Wtorek' },
    { key : 'sroda', label : 'Środa' },
    { key : 'czwartek', label : 'Czwartek' },
    { key : 'piatek', label : 'Piątek' },
  ];

  protected deklaracjaForm! : FormGroup;
  protected filterForm! : FormGroup;
  protected addForm! : FormGroup;

  protected declarations : Declaration[] = [];
  protected result : Declaration[] = [];
  protected showWindow : 'filter' | 'delete' | 'add' | '' = '';

  @ViewChild('filter') filter! : ElementRef;

  constructor(
    private variables : VariablesService,
    private database : DataService,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone,
    private datePipe : DatePipe,
    protected infoService : GlobalInfoService
  ) {
    this.deklaracjaForm = new FormGroup({
      data_od : new FormControl(this.dateInput(new Date()), Validators.required),
      data_do : new FormControl(this.dateInput(new Date()), Validators.required),
      dni : this.createDniFormGroup(false)
    });
    this.filterForm = new FormGroup({
      data_od : new FormControl(''),
      data_do : new FormControl(''),
      dni : this.createDniFormGroup(true)
    });
    this.addForm = new FormGroup({
      data_od : new FormControl('', Validators.required),
      data_do : new FormControl('', Validators.required),
      dni : this.createDniFormGroup(true)
    });

    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {

      this.infoService.activeUser.pipe(takeUntil(this.destroy$)).subscribe(user => {
        if (!user) return;
        this.deklaracjaForm.reset();
        this.infoService.setTitle(`${ user.imie } ${ user.nazwisko } - Deklaracje`);
        this.infoService.setActiveTab('DEKLARACJE');
        this.user_id = user.id;
        this.reloadDeclarations();
      });
    });
  }


  private createDniFormGroup(checked : boolean) : FormGroup {
    return new FormGroup({
      poniedzialek : new FormControl(checked),
      wtorek : new FormControl(checked),
      sroda : new FormControl(checked),
      czwartek : new FormControl(checked),
      piatek : new FormControl(checked),
    });
  }

  private reloadDeclarations() : void {
    this.database.request('zsti.declaration.getById', { id : this.user_id }, 'declarationList').then((payload) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać deklaracji.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak deklaracji dla tej osoby.');
        this.result = this.declarations = [];
        this.invalidDates = [];
        return;
      }
      this.result = this.declarations = payload;
      this.result = this.result.sort((a, b) => {
        const dateA = new Date(a.data_od).getTime();
        const dateB = new Date(b.data_od).getTime();
        return dateB - dateA;
      });
      this.invalidDates = [];

      this.declarations.forEach((decl) => {
        if (!(decl.data_od && decl.data_do)) return;
        this.invalidDates.push(new Date(decl.data_od), new Date(decl.data_do));
      });
    });
  }

  private getDay(days : string, position : number) : boolean {
    return days[position] === '1';
  }

  private dateInput(date : Date) : string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  protected getDzienKey(key : string, type : 'deklaracjaForm' | 'filterForm' | 'addForm') : FormControl {
    return (this[type] as FormGroup).get('dni')?.get(key) as FormControl;
  }

  protected selectDeclaration(declaration : Declaration) : void {
    this.deklaracjaForm.patchValue({
      data_od : this.dateInput(new Date(declaration.data_od)),
      data_do : this.dateInput(new Date(declaration.data_do)),
      dni : {
        poniedzialek : this.getDay(declaration.dni, 0),
        wtorek : this.getDay(declaration.dni, 1),
        sroda : this.getDay(declaration.dni, 2),
        czwartek : this.getDay(declaration.dni, 3),
        piatek : this.getDay(declaration.dni, 4)
      }
    });
    this.id = declaration.id;
  }

  protected updateDeclaration() : void {
    if (this.deklaracjaForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.deklaracjaForm.value;
    const dniObj = formValue.dni ?? {};
    const dni = Object.keys(dniObj)
      .map(key => dniObj[key as keyof typeof dniObj] ? '1' : '0')
      .join('');
    const declaration : Declaration = {
      id : this.id,
      id_osoby : this.infoService.activeUser.value?.id || 0,
      data_od : formValue.data_od!,
      data_do : formValue.data_do!,
      dni : dni,
    }
    if (declaration.id_osoby === 0) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Nie można dodać deklaracji bez ID osoby.');
      return;
    }
    const original = this.declarations.find(d => d.id === declaration.id);
    const dniChanged = !!original && original.dni !== dni;
    const datesChanged = !!original && (
      this.dateInput(new Date(original.data_od)) !== declaration.data_od ||
      this.dateInput(new Date(original.data_do)) !== declaration.data_do
    );
    if (!(dniChanged || datesChanged)) {
      this.infoService.generateNotification(NotificationType.WARNING, 'Deklaracja nie została zmieniona.');
      return;
    }
    if (!dniChanged && datesChanged && this.invalidDates.some((date, idx, arr) => {
      if (idx % 2 !== 0) return false;
      const start = arr[idx];
      const end = arr[idx + 1];
      const conflictingDeclaration = this.declarations.find(d =>
        this.dateInput(new Date(d.data_od)) === this.dateInput(start) &&
        this.dateInput(new Date(d.data_do)) === this.dateInput(end)
      );
      if (conflictingDeclaration && conflictingDeclaration.id === declaration.id) return false;
      const od = new Date(declaration.data_od).getTime();
      const do_ = new Date(declaration.data_do).getTime();
      return (od <= end.getTime() && do_ >= start.getTime());
    })) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Deklaracja nachodzi się z istniejącymi datami.');
      return;
    }
    if (declaration.data_od > declaration.data_do) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    this.database.request('zsti.declaration.update', { ...declaration, rok_szkolny_id : 1 }, 'declaration').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się zaktualizować deklaracji.');
        return;
      }

      this.infoService.generateNotification(NotificationType.SUCCESS, 'Deklaracja została zaktualizowana.');

      this.reloadDeclarations();
    });
  }

  protected openWindow(type : 'filter' | 'delete' | 'add') : void {
    this.showWindow = type;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.filter.nativeElement, true, this.zone).then();
  }

  protected closeWindow() : void {
    this.transition.applyAnimation(this.filter.nativeElement, false, this.zone).then(() => {
      this.showWindow = '';
    });
  }

  protected applyFilter() : void {
    if (this.filterForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.filterForm.value;
    const dniObj = formValue.dni ?? {};
    const dni = Object.keys(dniObj)
      .map(key => dniObj[key as keyof typeof dniObj] ? '1' : '0')
      .join('');
    const dataOd = formValue.data_od ? new Date(formValue.data_od).getTime() : null;
    const dataDo = formValue.data_do ? new Date(formValue.data_do).getTime() : null;

    this.result = this.declarations.filter(decl => {
      const declDataOd = new Date(decl.data_od).getTime();
      const declDataDo = new Date(decl.data_do).getTime();
      const dniMatch = dni === '' || decl.dni === dni;
      const dateMatch = (
        (dataOd === null || dataDo === null) ||
        (dataOd <= declDataDo && dataDo >= declDataOd)
      );
      return dniMatch && dateMatch;
    });
    if (this.result.length === 0) {
      this.infoService.generateNotification(NotificationType.WARNING, 'Brak wyników pasujących do filtra.');
    } else {
      this.infoService.generateNotification(NotificationType.SUCCESS, `Pomyślnie zastosowano filtry. Znaleziono ${ this.result.length } ${ wynikString(this.result.length) }.`);
    }
    this.closeWindow();
  }

  protected checkForFilter() : boolean {
    const dniValues = Object.values(this.filterForm.value.dni || {});
    return (!!this.filterForm.value.data_od || !!this.filterForm.value.data_do) ||
      (dniValues.some(value => value === true) && dniValues.some(value => value === false));
  }

  protected resetFilter() : void {
    this.filterForm.reset({
      data_od : '',
      data_do : '',
      dni : {
        poniedzialek : true,
        wtorek : true,
        sroda : true,
        czwartek : true,
        piatek : true,
      }
    });
    this.result = this.declarations;
    this.infoService.generateNotification(NotificationType.INFO, 'Filtr został zresetowany.');
  }

  protected deleteDeclaration() : void {
    if (this.id === 0) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę wybrać deklarację do usunięcia.');
      return;
    }
    this.database.request('zsti.declaration.delete', { id : this.id }, 'declaration').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się usunąć deklaracji.');
        return;
      }
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Deklaracja została usunięta.');
      this.reloadDeclarations();
      this.closeWindow();
    });
  }

  protected addDeclaration() : void {
    if (this.addForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const formValue = this.addForm.value;
    const dniObj = formValue.dni ?? {};
    const dni = Object.keys(dniObj)
      .map(key => dniObj[key as keyof typeof dniObj] ? '1' : '0')
      .join('');
    const declaration : Declaration = {
      id_osoby : this.user_id,
      data_od : formValue.data_od!,
      data_do : formValue.data_do!,
      dni : dni,
    } as any
    if (declaration.id_osoby === 0) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Nie można dodać deklaracji bez ID osoby.');
      return;
    }
    if (this.invalidDates.some((date, idx, arr) => {
      if (idx % 2 !== 0) return false;
      const start = arr[idx];
      const end = arr[idx + 1];
      const od = new Date(declaration.data_od).getTime();
      const do_ = new Date(declaration.data_do).getTime();
      if (do_ < start.getTime()) return false;
      return od <= end.getTime();

    })) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Deklaracja nachodzi się z istniejącymi datami.');
      return;
    }
    if (declaration.data_od > declaration.data_do) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data "od" nie może być późniejsza niż data "do".');
      return;
    }
    this.database.request('zsti.declaration.add', { ...declaration, rok_szkolny_id : 1 }, 'declaration').then((payload) => {
      if (!payload || payload.length === 0) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać deklaracji.');
        return;
      }

      this.infoService.generateNotification(NotificationType.SUCCESS, 'Deklaracja została dodana.');
      this.reloadDeclarations();
    });
  }

  public ngOnDestroy() : void {
    this.result = this.declarations = [];
    this.destroy$.next();
    this.destroy$.complete();
    this.id = 0;
    this.user_id = 0;
    this.invalidDates = [];
    this.deklaracjaForm.reset();
    this.filterForm.reset();
    this.addForm.reset();
    this.showWindow = '';
  }
}
