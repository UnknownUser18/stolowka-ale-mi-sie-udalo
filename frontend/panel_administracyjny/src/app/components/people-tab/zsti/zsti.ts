import { Component, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Persons, TypOsoby, ZPerson } from '@database/persons/persons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faArrowUpWideShort, faCheck, faCircle, faFilter, faMagnifyingGlass, faPlus, faRotateLeft, faSchool, faUser, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Notifications } from '@services/notifications';
import { DialogTriggerDirective } from '@directives/dialog/dialog-trigger.directive';
import { TooltipDelayTriggerDirective } from '@directives/delayTooltip/tooltip-delay-trigger.directive';
import { ButtonDanger, ButtonDefault, ButtonPrimary, ButtonSecondary, ButtonSuccess, Dialog, Dropdown, Input, LabelOneLine, PrimaryText, Switch, Table, Tooltip } from '@ui';
import { State } from '@shared/switch/switch';
import { TooltipClickTriggerDirective } from '@directives/clickTooltip/tooltip-click-trigger.directive';
import { TooltipTriggerDirective } from '@directives/tooltip/tooltip-trigger.directive';
import { Router } from '@angular/router';
import { Field, form } from "@angular/forms/signals";
import { LastPersons } from "@services/last-persons";

type FilteringOption = 'match' | 'startsWith' | 'endsWith' | 'contains' | 'excludes';
type SortOption = 'surnameAsc' | 'surnameDesc' |
  'nameAsc' | 'nameDesc' |
  'classAsc' | 'classDesc' |
  'typeAsc' | 'typeDesc' |
  'attendanceAsc' | 'attendanceDesc' |
  'cityAsc' | 'cityDesc' |
  'idAsc' | 'idDesc';

@Component({
  selector : 'app-zsti',
  imports  : [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent,
    Dialog,
    DialogTriggerDirective,
    Tooltip,
    TooltipDelayTriggerDirective,
    Switch,
    TooltipClickTriggerDirective,
    TooltipTriggerDirective,
    Field,
    Dropdown,
    ButtonPrimary,
    ButtonDefault,
    ButtonSecondary,
    PrimaryText,
    Table,
    Input,
    LabelOneLine,
    ButtonDanger,
    ButtonSuccess,
  ],
  templateUrl : './zsti.html',
  styleUrl : './zsti.scss'
})
export class Zsti {
  private ZPersons : ZPerson[] | null = [];
  private filterModel = signal({
    imie            : '',
    imie_filter     : 'contains' as FilteringOption,
    nazwisko        : '',
    nazwisko_filter : 'contains' as FilteringOption,
    klasa           : '',
    uczeszcza       : 'all' as State,
    miasto          : 'all' as State,
    typ_osoby       : 'all' as string,
  });

  protected readonly dialog = viewChild.required<Dialog>('filterDialog');
  protected readonly isRefreshing = signal(false);
  protected readonly usedSortOption = signal<SortOption>('idAsc');

  protected readonly filteringOptions : Map<FilteringOption, string> = new Map([
    ['match', 'Dokładne dopasowanie'],
    ['startsWith', 'Zaczyna się od'],
    ['endsWith', 'Kończy się na'],
    ['contains', 'Zawiera'],
    ['excludes', 'Nie zawiera'],
  ]);

  protected readonly typOsobyOptions : Map<string, string> = new Map([
    ['all', 'Wszyscy'],
    [TypOsoby.UCZEN.toString(), 'Uczeń'],
    [TypOsoby.NAUCZYCIEL.toString(), 'Nauczyciel'],
    [TypOsoby.PELNOLETNI_UCZEN.toString(), 'Pełnoletni uczeń'],
  ]);


  protected readonly sortOptions : Map<SortOption, string> = new Map([
    ['nameAsc', 'Imię rosnąco'],
    ['nameDesc', 'Imię malejąco'],
    ['surnameAsc', 'Nazwisko rosnąco'],
    ['surnameDesc', 'Nazwisko malejąco'],
    ['classAsc', 'Klasa rosnąco'],
    ['classDesc', 'Klasa malejąco'],
    ['typeAsc', 'Typ osoby rosnąco'],
    ['typeDesc', 'Typ osoby malejąco'],
    ['attendanceAsc', 'Uczęszcza rosnąco'],
    ['attendanceDesc', 'Uczęszcza malejąco'],
    ['cityAsc', 'Miasto rosnąco'],
    ['cityDesc', 'Miasto malejąco'],
    ['idAsc', 'ID rosnąco'],
    ['idDesc', 'ID malejąco'],
  ]);

  protected readonly faIcons = {
    faMagnifyingGlass,
    faFilter,
    faPlus,
    faArrowUpWideShort,
    faArrowsRotate,
    faCircle,
    faWarning,
    faUser,
    faSchool,
    faCheck,
    faRotateLeft,
  }

  protected search = '';
  protected shownZPersons : ZPerson[] | null | undefined;
  protected readonly TypOsoby = TypOsoby;
  protected filterForm = form(this.filterModel);


  constructor(
    private personS : Persons,
    private notificationsS : Notifications,
    private lastPersonsS : LastPersons,
    private router : Router) {
    this.requestPersons();
  }

  private filterByOption(input : string, object : string, option : FilteringOption,) : boolean {
    const filterQuery = input.toLowerCase();

    switch (option) {
      case 'match':
        return object.toLowerCase() === filterQuery;
      case 'startsWith':
        return object.toLowerCase().startsWith(filterQuery);
      case 'endsWith':
        return object.toLowerCase().endsWith(filterQuery);
      case 'contains':
        return object.toLowerCase().includes(filterQuery);
      case 'excludes':
        return !object.toLowerCase().includes(filterQuery);
      default:
        return false;
    }
  }

  protected isTeacher(person : ZPerson) : boolean {
    return this.personS.isTeacher(person);
  }

  protected requestPersons() {
    this.shownZPersons = undefined;
    this.isRefreshing.set(true);

    this.personS.getZPersons().subscribe((persons : ZPerson[] | null) => {
      this.ZPersons = persons;
      this.shownZPersons = this.ZPersons;

      this.isRefreshing.set(false);

      if (!persons)
        this.notificationsS.createErrorNotification('Nie udało się pobrać listy osób.', 10);
      else if (persons.length === 0)
        this.notificationsS.createWarningNotification('Brak osób w bazie danych.', 10);
      else {
        this.notificationsS.createSuccessNotification('Pobrano listę osób z serwera.', 2);
        this.sortPersons(this.usedSortOption());
      }
    });
  }

  protected osobString(number : number) : string {
    if (number === 0) return 'osób.';
    else if (number === 1) return 'osoba.';
    else if (number > 1 && number < 5) return 'osoby.';
    else return 'osób.';
  }

  protected filterZPersons() : void {
    if (!this.ZPersons) return;

    if (this.search === '') {
      this.shownZPersons = this.ZPersons;
      return;
    }

    const search = this.search;
    let imie, nazwisko;
    const split = search.split(' ');

    if (split.length > 1) {
      nazwisko = split[0]
      imie = split[1];
    } else {
      imie = nazwisko = search;
    }

    this.shownZPersons = this.ZPersons.filter(person => {
      const { imie : imieP, nazwisko : nazwiskoP } = person;
      return (imieP.toLowerCase().includes(imie.toLowerCase()) || nazwiskoP.toLowerCase().includes(nazwisko.toLowerCase()));
    })
  }

  protected applyFilters() {
    if (!this.ZPersons) return;

    const { imie, imie_filter, nazwisko, nazwisko_filter, klasa, uczeszcza, miasto, typ_osoby } = this.filterForm().value();

    if (imie.trim() === '' && nazwisko.trim() === '' && klasa.trim() === '' && uczeszcza === 'all' && miasto === 'all' && typ_osoby === 'all') {
      this.shownZPersons = this.ZPersons;
      this.dialog().hide();
      return;
    }

    this.shownZPersons = this.ZPersons.filter((person) => {
      let matches = true;
      if (imie && imie.trim() !== '')
        matches = matches && this.filterByOption(imie, person.imie, imie_filter);

      if (nazwisko && nazwisko.trim() !== '')
        matches = matches && this.filterByOption(nazwisko, person.nazwisko, nazwisko_filter);

      if (klasa && klasa.trim() !== '') {
        if (klasa.includes(',')) {
          const classes = klasa.split(',').map((c : string) => c.trim().toLowerCase());
          matches = matches && person.klasa ? classes.includes(person.klasa.toLowerCase()) : false;
        } else
          matches = matches && person.klasa ? person.klasa.toLowerCase() === klasa.trim().toLowerCase() : false;
      }

      if (uczeszcza !== 'all')
        matches = matches && ((uczeszcza === 'on') ? person.uczeszcza : !person.uczeszcza)!;

      if (miasto !== 'all')
        matches = matches && ((miasto === 'on') ? person.miasto : !person.miasto)!;

      if (typ_osoby !== 'all')
        matches = matches && person.typ_osoby_id === (Number.isNaN(Number(typ_osoby)) ? typ_osoby : Number(typ_osoby));

      return matches ? person : null;
    });

    this.search = (imie.trim() + ' ' + nazwisko.trim()).trim();

    this.dialog().hide();
  }

  protected sortPersons(option : SortOption) {
    if (!this.shownZPersons) return;

    this.usedSortOption.set(option);

    this.shownZPersons = [...this.shownZPersons].sort((a, b) => {
      switch (option) {
        case 'surnameAsc':
          return a.nazwisko.localeCompare(b.nazwisko) || a.imie.localeCompare(b.imie);
        case 'surnameDesc':
          return b.nazwisko.localeCompare(a.nazwisko) || b.imie.localeCompare(a.imie);
        case 'nameAsc':
          return a.imie.localeCompare(b.imie) || a.nazwisko.localeCompare(b.nazwisko);
        case 'nameDesc':
          return b.imie.localeCompare(a.imie) || b.nazwisko.localeCompare(a.nazwisko);
        case 'classAsc':
          return (a.klasa ?? '').localeCompare(b.klasa ?? '') || a.nazwisko.localeCompare(b.nazwisko) || a.imie.localeCompare(b.imie);
        case 'classDesc':
          return (b.klasa ?? '').localeCompare(a.klasa ?? '') || b.nazwisko.localeCompare(a.nazwisko) || b.imie.localeCompare(a.imie);
        case 'typeAsc':
          return (a.typ_osoby_id?.toString() ?? '').localeCompare(b.typ_osoby_id?.toString() ?? '') ||
            a.nazwisko.localeCompare(b.nazwisko) ||
            a.imie.localeCompare(b.imie);
        case 'typeDesc':
          return (b.typ_osoby_id?.toString() ?? '').localeCompare(a.typ_osoby_id?.toString() ?? '') ||
            b.nazwisko.localeCompare(a.nazwisko) ||
            b.imie.localeCompare(a.imie);
        case 'attendanceAsc':
          return (a.uczeszcza === b.uczeszcza) ? 0 : a.uczeszcza ? -1 : 1 ||
            a.nazwisko.localeCompare(b.nazwisko) ||
            a.imie.localeCompare(b.imie);
        case 'attendanceDesc':
          return (a.uczeszcza === b.uczeszcza) ? 0 : a.uczeszcza ? 1 : -1 ||
            b.nazwisko.localeCompare(a.nazwisko) ||
            b.imie.localeCompare(a.imie);
        case 'cityAsc':
          return (a.miasto === b.miasto) ? 0 : a.miasto ? -1 : 1 ||
            a.nazwisko.localeCompare(b.nazwisko) ||
            a.imie.localeCompare(b.imie);
        case 'cityDesc':
          return (a.miasto === b.miasto) ? 0 : a.miasto ? 1 : -1 ||
            b.nazwisko.localeCompare(a.nazwisko) ||
            b.imie.localeCompare(a.imie);
        case 'idAsc':
          return (a.id ?? 0) - (b.id ?? 0);
        case 'idDesc':
          return (b.id ?? 0) - (a.id ?? 0);
        default:
          return 0;
      }
    });
  }

  protected selectPerson(person : ZPerson) {
    this.personS.selectZPerson(person);
    this.lastPersonsS.pushZPerson(person.id);
    this.router.navigate(['/osoba/zsti', person.id]).then();
  }
}
