import {ChangeDetectorRef, Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {DataService, Student, TypOsoby, WebSocketStatus} from '../data.service';
import {Router} from '@angular/router';
import {GlobalInfoService} from '../global-info.service';
import {FormsModule} from '@angular/forms';
import {take} from 'rxjs';

@Component({
  selector: 'app-zsti',
  imports: [
    FormsModule,
  ],
  templateUrl: './zsti.component.html',
  styleUrl: './zsti.component.scss'
})
export class ZstiComponent {
  @ViewChild('section_filter') sectionFilter : ElementRef | undefined;
  protected searchTerm : string | undefined;
  protected persons_zsti : Student[] | undefined;
  protected result : Student[] | undefined;
  protected showFilter : boolean = false;
  protected filter = {
    imie : '',
    nazwisko : '',
    klasa : '',
    miasto : 'wszyscy',
    typ_osoby : 3,
    uczeszcza : 'wszyscy',
  }
  constructor(
    private globalInfoService: GlobalInfoService,
    private database: DataService,
    protected cdr: ChangeDetectorRef,
    private router : Router,
    private zone : NgZone) {
    this.globalInfoService.setTitle('ZSTI - Osoby');
    this.globalInfoService.webSocketStatus.subscribe(status => {
      console.log(status)
      if (status !== WebSocketStatus.OPEN) return;
      this.database.request('zsti.student.get', {}, 'studentList').then((payload) => {
        this.result = this.persons_zsti = payload;
      });
    })
  }
  private applyAnimation(open: boolean): Promise<boolean> {
    return new Promise((resolve): void => {
      this.zone.onStable.pipe(take(1)).subscribe((): void => {
        requestAnimationFrame((): void => {
          const filterBackground: HTMLElement = this.sectionFilter!.nativeElement as HTMLElement;
          const filterMain: HTMLElement = filterBackground.querySelector('section > div')!;

          filterBackground.classList.toggle('done', open);
          filterMain.classList.toggle('done', open);

          const onTransitionEnd = (e: TransitionEvent): void => {
            if (e.target === filterMain) { // Check if the event target is the filterMain element
              filterMain.removeEventListener('transitionend', onTransitionEnd);
              resolve(true);
            }
          };

          filterMain.addEventListener('transitionend', onTransitionEnd);
        });
      });
    });
  }
  private applyFilterLogic(use_filter : boolean = false) : void {
    if(this.filter.typ_osoby === TypOsoby.NAUCZYCIEL) this.filter.klasa = '';
    this.result = this.persons_zsti!.filter((person : Student) : boolean => {
      const { imie, nazwisko, klasa, miasto, typ_osoby_id, uczeszcza } = person;
      if(use_filter) {
        const searchTerm : string = this.searchTerm?.toLowerCase()!;
        return (
          imie.toLowerCase().includes(searchTerm) &&
          nazwisko.toLowerCase().includes(searchTerm) &&
          klasa.toLowerCase().includes(this.filter.klasa.toLowerCase()) &&
          (this.filter.miasto === 'wszyscy' ? true : this.filter.miasto === 'true' ? miasto : !miasto) &&
          (this.filter.typ_osoby === 3 || Number(this.filter.typ_osoby) === typ_osoby_id as TypOsoby) &&
          (this.filter.uczeszcza === 'wszyscy' ? true : this.filter.uczeszcza === 'true' ? uczeszcza : !uczeszcza)
        );
      }
      return (
        imie.toLowerCase().includes(this.filter.imie.toLowerCase()) &&
        nazwisko.toLowerCase().includes(this.filter.nazwisko.toLowerCase()) &&
        klasa.toLowerCase().includes(this.filter.klasa.toLowerCase()) &&
        (this.filter.miasto === 'wszyscy' ? true : this.filter.miasto === 'true' ? miasto : !miasto) &&
        (this.filter.typ_osoby === 3 || Number(this.filter.typ_osoby) === typ_osoby_id as TypOsoby) &&
        (this.filter.uczeszcza === 'wszyscy' ? true : this.filter.uczeszcza === 'true' ? uczeszcza : !uczeszcza)
      );
    });
  }

  protected filterPersons(event : Event) : void {
    if(event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (this.searchTerm === undefined) return;
    this.applyFilterLogic(true);
  }
  protected openFilterMenu() : void {
    this.showFilter = true;
    this.applyAnimation(true).then(() : void => {
      const searchTerm : string = this.searchTerm ?? '';
      if (searchTerm.includes(' ') && searchTerm.length > 0) {
        this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.split(' ')[0].slice(1);
        this.filter.nazwisko = searchTerm.split(' ')[1].charAt(0).toUpperCase() + searchTerm.split(' ')[1].slice(1);
      } else {
        this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
      }
    });
  }
  protected applyFilter() : void {
    this.applyAnimation(false).then((r : boolean) : void => {
      if(r) this.showFilter = false;
    }).finally(() : void => {
      this.applyFilterLogic();
      this.searchTerm = (this.filter.imie + ' ' + this.filter.nazwisko).trim();
    });
  }
  protected closeFilterMenu() : void {
    this.applyAnimation(false).then((r : boolean) : void => {
      if(r) this.showFilter = false;
    });
  }
  protected selectPerson(user : Student) : void {
    this.router.navigate(['osoba/zsti', user.id, 'kalendarz']).then(() : void => {
      this.globalInfoService.setActiveUser(user);
    });
  }

  protected readonly TypOsoby = TypOsoby;
}
