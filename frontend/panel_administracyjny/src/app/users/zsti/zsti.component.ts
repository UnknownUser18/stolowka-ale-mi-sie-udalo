import { Component, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonsService, ZPerson, TypOsoby } from '@database/persons.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faArrowUpWideShort, faCheck, faCircle, faFilter, faMagnifyingGlass, faPlus, faRotateLeft, faSchool, faUser, faUserPlus, faUserShield, faWarning } from '@fortawesome/free-solid-svg-icons';
import { NotificationsService } from '@services/notifications.service';
import { DialogComponent } from '@tooltips/dialog/dialog.component';
import { DialogTriggerDirective } from '@tooltips/dialog-trigger.directive';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { TooltipDelayTriggerDirective } from '@tooltips/tooltip-delay-trigger.directive';
import { SwitchComponent, State } from '@switch';
import { TooltipClickTriggerDirective } from '@tooltips/tooltip-click-trigger.directive';
import { TooltipTriggerDirective } from '@tooltips/tooltip-trigger.directive';
import { Router } from '@angular/router';

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
  imports : [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent,
    DialogComponent,
    DialogTriggerDirective,
    TooltipComponent,
    TooltipDelayTriggerDirective,
    SwitchComponent,
    TooltipClickTriggerDirective,
    TooltipTriggerDirective,
  ],
  templateUrl : './zsti.component.html',
  styleUrl : './zsti.component.scss'
})
export class ZstiComponent {
  private ZPersons : ZPerson[] | null = [];

  protected readonly dialog = viewChild.required<DialogComponent>('filterDialog');
  protected readonly isRefreshing = signal(false);
  protected readonly usedSortOption = signal<SortOption>('idAsc');
  protected readonly isAddingPerson = signal(false);

  protected readonly Number = Number;

  protected readonly filteringOptions : Map<FilteringOption, string> = new Map([
    ['match', 'Dokładne dopasowanie'],
    ['startsWith', 'Zaczyna się od'],
    ['endsWith', 'Kończy się na'],
    ['contains', 'Zawiera'],
    ['excludes', 'Nie zawiera'],
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

  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faFilter = faFilter;
  protected readonly faPlus = faPlus;
  protected readonly faArrowUpWideShort = faArrowUpWideShort;
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faCircle = faCircle;
  protected readonly faWarning = faWarning;
  protected readonly faUser = faUser;
  protected readonly faSchool = faSchool;
  protected readonly faCheck = faCheck;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faUserPlus = faUserPlus;
  protected readonly faUserShield = faUserShield;
  protected readonly TypOsoby = TypOsoby;

  protected search = '';
  protected shownZPersons : ZPerson[] | null | undefined;

  protected filterForm : FormGroup = new FormGroup({
    imie : new FormControl(''),
    imie_filter : new FormControl<FilteringOption>('contains'),
    nazwisko : new FormControl(''),
    nazwisko_filter : new FormControl<FilteringOption>('contains'),
    klasa : new FormControl(''),
    uczeszcza : new FormControl<State>('all'),
    miasto : new FormControl<State>('all'),
    typ_osoby : new FormControl<TypOsoby | 'all'>('all')
  });

  protected readonly namePattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/;
  protected readonly phonePattern = /^\+\d{1,3} \d{9}$/;

  protected addPersonForm : FormGroup = new FormGroup({
    imie : new FormControl('', [Validators.required, Validators.pattern(this.namePattern)]),
    nazwisko : new FormControl('', [Validators.required, Validators.pattern(this.namePattern)]),
    klasa : new FormControl(''),
    uczeszcza : new FormControl<boolean>(true, [Validators.required]),
    miasto : new FormControl<boolean>(false, [Validators.required]),
    typ_osoby : new FormControl<TypOsoby>(TypOsoby.UCZEN, [Validators.required]),
    imie_opiekuna : new FormControl(''),
    nazwisko_opiekuna : new FormControl(''),
    telefon : new FormControl('', [Validators.required, Validators.pattern(this.phonePattern)]),
    email : new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private personS : PersonsService,
    private notificationsS : NotificationsService,
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

    const { imie, imie_filter, nazwisko, nazwisko_filter, klasa, uczeszcza, miasto, typ_osoby } = this.filterForm.value;

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
        matches = matches && person.typ_osoby_id === typ_osoby;

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
    this.router.navigate(['/osoba/zsti', person.id]).then();
  }

  protected updateValidators() {
    const typ_osoby = this.addPersonForm.get('typ_osoby')?.value;
    const klasa = this.addPersonForm.get('klasa')!;
    const imie_opiekuna = this.addPersonForm.get('imie_opiekuna')!;
    const nazwisko_opiekuna = this.addPersonForm.get('nazwisko_opiekuna')!;
    const telefon = this.addPersonForm.get('telefon')!;
    const email = this.addPersonForm.get('email')!;

    if (Number(typ_osoby) === TypOsoby.UCZEN) {
      imie_opiekuna.setValidators([Validators.required, Validators.pattern(this.namePattern)]);
      nazwisko_opiekuna.setValidators([Validators.required, Validators.pattern(this.namePattern)]);
      klasa.setValidators([Validators.required]);
      telefon.setValidators([Validators.required, Validators.pattern(this.phonePattern)]);
      email.setValidators([Validators.required, Validators.email]);
      imie_opiekuna.enable();
      nazwisko_opiekuna.enable();
      klasa.enable();
      telefon.enable();
      email.enable();
    } else {
      imie_opiekuna.setValidators(null);
      nazwisko_opiekuna.setValidators(null);
      klasa.setValidators(null);
      telefon.setValidators(null);
      email.setValidators(null);
      imie_opiekuna.disable();
      nazwisko_opiekuna.disable();
      klasa.disable();
      telefon.disable();
      email.disable();
      this.addPersonForm.patchValue({ imie_opiekuna : '', nazwisko_opiekuna : '', telefon : '', email : '' });
    }
  }

  protected addPerson() {
    if (this.addPersonForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy. Popraw je i spróbuj ponownie.', 5);
      return;
    }

    this.isAddingPerson.set(true);

    const { imie, nazwisko, klasa, uczeszcza, miasto, typ_osoby, imie_opiekuna, nazwisko_opiekuna, telefon, email } = this.addPersonForm.value;

    const newPerson : Omit<ZPerson, 'id' | 'opiekun_id'> = {
      imie : imie.trim(),
      nazwisko : nazwisko.trim(),
      klasa : klasa ? klasa.trim() : null,
      uczeszcza : uczeszcza,
      miasto : miasto,
      typ_osoby_id : typ_osoby,
    }

    if (typ_osoby === TypOsoby.UCZEN) {
      if (!imie_opiekuna || !nazwisko_opiekuna || imie_opiekuna.trim() === '' || nazwisko_opiekuna.trim() === '') {
        this.notificationsS.createErrorNotification('Formularz zawiera błędy. Popraw je i spróbuj ponownie.', 5);
        return;
      }
      const newGuardian = {
        imie_opiekuna : imie_opiekuna.trim(),
        nazwisko_opiekuna : nazwisko_opiekuna.trim(),
        nr_kierunkowy : Number(telefon.split(' ')[0].replace('+', '')),
        telefon : Number(telefon.split(' ')[1]),
        email : email.trim(),
      }
      this.personS.addZPerson(newPerson, newGuardian).subscribe((res) => {
        this.isAddingPerson.set(false);
        if (!res) {
          this.notificationsS.createErrorNotification('Nie udało się dodać osoby. Spróbuj ponownie.', 10);
          return;
        }
        this.notificationsS.createSuccessNotification('Pomyślnie dodano osobę.', 5);
        this.addPersonForm.reset({
          imie : '',
          nazwisko : '',
          klasa : '',
          uczeszcza : true,
          miasto : false,
          typ_osoby : TypOsoby.UCZEN,
          imie_opiekuna : '',
          nazwisko_opiekuna : '',
          telefon : '',
          email : '',
        });
        this.requestPersons();
      });
    } else {
      this.personS.addZPerson(newPerson, null).subscribe((res) => {
        this.isAddingPerson.set(false);
        if (!res) {
          this.notificationsS.createErrorNotification('Nie udało się dodać osoby. Spróbuj ponownie.', 10);
          return;
        }
        this.notificationsS.createSuccessNotification('Pomyślnie dodano osobę.', 5);
        this.addPersonForm.reset({
          imie : '',
          nazwisko : '',
          klasa : '',
          uczeszcza : true,
          miasto : false,
          typ_osoby : TypOsoby.NAUCZYCIEL,
          imie_opiekuna : '',
          nazwisko_opiekuna : '',
          telefon : '',
          email : '',
        });
        this.requestPersons();
      });
    }
  }
}
