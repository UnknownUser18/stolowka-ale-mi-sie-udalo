import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Opiekun, Student, TypOsoby } from '../../services/data.service';
import { Router } from '@angular/router';
import { GlobalInfoService, NotificationType } from '../../services/global-info.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransitionService } from '../../services/transition.service';
import { VariablesService } from '../../services/variables.service';
import { Subject } from 'rxjs';

export function wynikString(number : number) : string {
  if (number < 0) console.warn('Number cannot be negative in wynikString function');
  if (number === 1) return 'wynik';
  if (number < 5 && number > 0) return 'wyniki';
  return 'wyników';
}


@Component({
  selector : 'app-zsti',
  imports : [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl : './zsti.component.html',
  styleUrl : './zsti.component.scss'
})
export class ZstiComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  protected readonly wynikString = wynikString;
  protected readonly TypOsoby = TypOsoby;
  protected searchTerm : string | undefined;
  protected persons_zsti : (Student & Opiekun)[] | undefined;
  protected result : (Student & Opiekun)[] | undefined;
  protected showFilter : boolean = false;
  protected filter = new FormGroup({
    imie : new FormControl('', Validators.pattern('[a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ]')),
    nazwisko : new FormControl('', Validators.pattern('[a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ]')),
    klasa : new FormControl('', Validators.pattern('[0-9a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ/ -]*')),
    miasto : new FormControl('wszyscy', Validators.required),
    typ_osoby : new FormControl('3', Validators.required),
    uczeszcza : new FormControl('wszyscy', Validators.required),
  });
  @ViewChild('section_filter') sectionFilter : ElementRef | undefined;


  constructor(
    private variables : VariablesService,
    private infoService : GlobalInfoService,
    private router : Router,
    private zone : NgZone,
    private transition : TransitionService,
    private cdr : ChangeDetectorRef) {
    this.infoService.setTitle('ZSTI - Osoby');
    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() : void => {
      if (this.persons_zsti) return;

      this.variables.mapStudentsToOpiekun().then((persons : (Student & Opiekun)[]) => {
        this.result = this.persons_zsti = persons;
      });
    });
  }

  private applyFilterLogic(use_filter : boolean = false) : void {
    if (this.filter.get('typ_osoby')?.value! === (TypOsoby.NAUCZYCIEL + '')) this.filter.get('klasa')?.setValue('');
    const filter = this.filter.getRawValue();
    if (!this.persons_zsti) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Nie można zastosować filtru, ponieważ nie załadowano jeszcze osób.');
      return;
    }
    if (!this.checkIfFilterUsed() && use_filter && this.searchTerm !== '') return;

    this.result = this.persons_zsti!.filter((person : Student & Opiekun) : boolean => {
      const searchTerm : string = this.searchTerm?.trim().toLowerCase() ?? '';
      if (use_filter) {
        if (searchTerm.split(' ').length > 1) {
          return (
            (person.imie.toLowerCase().includes(searchTerm.split(' ')[0])) &&
            (person.nazwisko.toLowerCase().includes(searchTerm.split(' ')[1]))
          )
        } else {
          return (
            (person.imie.toLowerCase().includes(searchTerm)) ||
            (person.nazwisko.toLowerCase().includes(searchTerm))
          )
        }

      } else {
        return (
          (person.imie.toLowerCase().includes(filter.imie?.toLowerCase() ?? '')) &&
          (person.nazwisko.toLowerCase().includes(filter.nazwisko?.toLowerCase() ?? '')) &&
          (person.klasa ? person.klasa.toString().toLowerCase() : '').includes(filter.klasa?.toLowerCase() || '') &&
          (filter.miasto === 'wszyscy' ? true : filter.miasto === 'true' ? person.miasto : !person.miasto) &&
          (filter.typ_osoby === '3' || Number(filter.typ_osoby) === Number(person.typ_osoby_id)) &&
          (filter.uczeszcza === 'wszyscy' ? true : filter.uczeszcza === 'true' ? person.uczeszcza : !person.uczeszcza)
        )
      }
    });
  }

  protected filterPersons(event : Event) : void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (this.searchTerm === undefined) return;
    this.applyFilterLogic(true);
  }

  protected openFilterMenu() : void {
    this.showFilter = true;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, true, this.zone).then(() : void => {
      const searchTerm : string = this.searchTerm ?? '';
      if (searchTerm.includes(' ') && searchTerm.length > 0) {
        this.filter.get('imie')?.setValue(searchTerm.charAt(0).toUpperCase() + searchTerm.split(' ')[0].slice(1));
        this.filter.get('nazwisko')?.setValue(searchTerm.split(' ')[1].charAt(0).toUpperCase() + searchTerm.split(' ')[1].slice(1));
      } else {
        this.filter.get('imie')?.setValue(searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1));
      }
    });
  }

  protected applyFilter() : void {
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, false, this.zone).then(() : void => {
      this.showFilter = false;
    }).finally(() : void => {
      this.applyFilterLogic();
      this.searchTerm = (this.filter.get('imie')?.value + ' ' + this.filter.get('nazwisko')?.value).trim();
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Pomyślnie zastosowano filtr.');
    });
  }

  protected closeFilterMenu() : void {
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, false, this.zone).then(() : void => {
      this.showFilter = false;
    });
  }

  protected selectPerson(user : Student & Opiekun) : void {
    this.router.navigate(['osoba/zsti', user.id, 'kalendarz']).then(() : void => {
      this.infoService.setActiveUser(user);
    });
  }

  protected onTypOsobyChange() : void {
    const typ = this.filter.get('typ_osoby')?.value;
    if (typ === (this.TypOsoby.NAUCZYCIEL + '')) {
      this.filter.get('klasa')?.disable({ emitEvent : false });
      this.filter.get('klasa')?.setValue('', { emitEvent : false });
    } else {
      this.filter.get('klasa')?.enable({ emitEvent : false });
    }
  }

  protected resetFilter() : void {
    this.filter.reset({
      imie : '',
      nazwisko : '',
      klasa : '',
      miasto : 'wszyscy',
      typ_osoby : '3',
      uczeszcza : 'wszyscy'
    });
    this.searchTerm = '';
    this.applyFilterLogic();
    this.infoService.generateNotification(NotificationType.INFO, 'Pomyślnie zresetowano filtr.');
  }

  protected checkIfFilterUsed() : boolean {
    const filter = this.filter.getRawValue();
    return (
      filter.imie !== '' ||
      filter.nazwisko !== '' ||
      filter.klasa !== '' ||
      filter.miasto !== 'wszyscy' ||
      filter.typ_osoby !== '3' ||
      filter.uczeszcza !== 'wszyscy' ||
      (this.searchTerm !== undefined && this.searchTerm.trim() !== '')
    );
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
