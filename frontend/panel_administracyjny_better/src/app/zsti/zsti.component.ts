import {ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {DataService, Student, TypOsoby, WebSocketStatus} from '../data.service';
import {Router} from '@angular/router';
import {GlobalInfoService} from '../global-info.service';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TransitionService} from '../transition.service';

@Component({
  selector: 'app-zsti',
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './zsti.component.html',
  styleUrl: './zsti.component.scss'
})
export class ZstiComponent {
  protected readonly TypOsoby = TypOsoby;
  protected searchTerm: string | undefined;
  protected persons_zsti: Student[] | undefined;
  protected result: Student[] | undefined;
  protected showFilter: boolean = false;
  protected filter = new FormGroup({
    imie: new FormControl('', Validators.pattern('[a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ]')),
    nazwisko: new FormControl('', Validators.pattern('[a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ]')),
    klasa: new FormControl('', Validators.pattern('[0-9a-zA-ZżźćńśłóęąŻŹĆŃŚŁÓĘĄ/ -]*')),
    miasto: new FormControl('wszyscy', Validators.required),
    typ_osoby: new FormControl('3', Validators.required),
    uczeszcza: new FormControl('wszyscy', Validators.required),
  });
  @ViewChild('section_filter') sectionFilter: ElementRef | undefined;


  constructor(
    private globalInfoService: GlobalInfoService,
    private database: DataService,
    private router: Router,
    private zone: NgZone,
    private transition: TransitionService,
    private cdr: ChangeDetectorRef) {
    this.globalInfoService.setTitle('ZSTI - Osoby');
    this.globalInfoService.webSocketStatus.subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
      this.database.request('zsti.student.get', {}, 'studentList').then((payload) => {
        this.result = this.persons_zsti = payload;
      });
    })
  }

  private applyFilterLogic(use_filter: boolean = false): void {
    if (this.filter.get('typ_osoby')?.value! === (TypOsoby.NAUCZYCIEL + '')) this.filter.get('klasa')?.setValue('');
    const filter = this.filter.value;
    this.result = this.persons_zsti!.filter((person: Student): boolean => {
      const {imie, nazwisko, klasa, miasto, typ_osoby_id, uczeszcza} = person;
      if (use_filter) {
        const searchTerm: string = this.searchTerm?.toLowerCase()!;
        return (
          imie.toLowerCase().includes(searchTerm) ||
          nazwisko.toLowerCase().includes(searchTerm) &&
          klasa.toLowerCase().includes(filter.klasa!.toLowerCase()) &&
          (filter.miasto === 'wszyscy' ? true : filter.miasto === 'true' ? miasto : !miasto) &&
          (filter.typ_osoby === '3' || Number(filter.typ_osoby) === typ_osoby_id as TypOsoby) &&
          (filter.uczeszcza === 'wszyscy' ? true : filter.uczeszcza === 'true' ? uczeszcza : !uczeszcza)
        );
      }
      return (
        imie.toLowerCase().includes(filter.imie!.toLowerCase()) &&
        nazwisko.toLowerCase().includes(filter.nazwisko!.toLowerCase()) &&
        klasa.toLowerCase().includes(filter.klasa?.toLowerCase() || '') &&
        (filter.miasto === 'wszyscy' ? true : filter.miasto === 'true' ? miasto : !miasto) &&
        (filter.typ_osoby === '3' || Number(filter.typ_osoby) === typ_osoby_id as TypOsoby) &&
        (filter.uczeszcza === 'wszyscy' ? true : filter.uczeszcza === 'true' ? uczeszcza : !uczeszcza)
      );
    });
  }

  protected filterPersons(event: Event): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (this.searchTerm === undefined) return;
    this.applyFilterLogic(true);
  }

  protected openFilterMenu(): void {
    this.showFilter = true;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, true, this.zone).then((): void => {
      const searchTerm: string = this.searchTerm ?? '';
      if (searchTerm.includes(' ') && searchTerm.length > 0) {
        this.filter.get('imie')?.setValue(searchTerm.charAt(0).toUpperCase() + searchTerm.split(' ')[0].slice(1));
        this.filter.get('nazwisko')?.setValue(searchTerm.split(' ')[1].charAt(0).toUpperCase() + searchTerm.split(' ')[1].slice(1));
      } else {
        this.filter.get('imie')?.setValue(searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1));
      }
    });
  }

  protected applyFilter(): void {
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, false, this.zone).then((): void => {
      this.showFilter = false;
    }).finally((): void => {
      this.applyFilterLogic();
      this.searchTerm = (this.filter.get('imie')?.value + ' ' + this.filter.get('nazwisko')?.value).trim();
    });
  }

  protected closeFilterMenu(): void {
    this.transition.applyAnimation(this.sectionFilter!.nativeElement, false, this.zone).then((): void => {
      this.showFilter = false;
    });
  }

  protected selectPerson(user: Student): void {
    this.router.navigate(['osoba/zsti', user.id, 'kalendarz']).then((): void => {
      this.globalInfoService.setActiveUser(user);
    });
  }

  protected onTypOsobyChange(): void {
    const typ = this.filter.get('typ_osoby')?.value;
    if (typ === (this.TypOsoby.NAUCZYCIEL + '')) {
      this.filter.get('klasa')?.disable({emitEvent: false});
      this.filter.get('klasa')?.setValue('', {emitEvent: false});
    } else {
      this.filter.get('klasa')?.enable({emitEvent: false});
    }
  }

  protected resetFilter(): void {
    this.filter.reset({
      imie: '',
      nazwisko: '',
      klasa: '',
      miasto: 'wszyscy',
      typ_osoby: '3',
      uczeszcza: 'wszyscy'
    });
    this.searchTerm = '';
    this.applyFilterLogic();
  }

  protected checkIfFilterUsed(): boolean {
    const filter = this.filter.value;
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
}

