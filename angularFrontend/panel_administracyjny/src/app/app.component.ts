import {Component, OnInit, ElementRef} from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import {NgForOf, NgOptimizedImage} from '@angular/common';
// @ts-ignore
import {DataBaseService} from './data-base.service';
import {GlobalnyPanelComponent} from './globalny-panel/globalny-panel.component';
import { MatDialog } from '@angular/material/dialog';
import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [PanelComponent, NgOptimizedImage, NgForOf, GlobalnyPanelComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  DOMelement : any | undefined;

  zsti_users: Array<{imie: string[], nazwisko: string[]}> = [
  {
    imie: [],
    nazwisko: []
  }
  ];
  internat_users : Array<{imie: string[], nazwisko: string[]}> = [
  {
    imie: [],
    nazwisko: []
  }
  ];
  sorted_zsti_users: Array<{ imie : string, nazwisko : string}> = [];
  sorted_internat_users: Array<{ imie: string, nazwisko : string}> = [];
  StudentListZstiData : Array<{ id : number, imie : string, nazwisko : string}> | null = null;
  StudentListInternatData: Array<{ id : number, imie : string, nazwisko : string }> | null = null;
  constructor(private dataService:DataBaseService, private el: ElementRef, private dialog: MatDialog) {
   this.DOMelement = this.el.nativeElement ? this.el.nativeElement : undefined;
  }
  ngOnInit() {
  this.dataService.StudentListZstiData.subscribe((data: Array<{ id : number, imie : string, nazwisko : string }>) => {
    this.StudentListZstiData = data;
    if (this.StudentListZstiData != null) {
      this.zsti_users[0].imie = this.StudentListZstiData.map((element) => element.imie);
      this.zsti_users[0].nazwisko = this.StudentListZstiData.map((element) => element.nazwisko);
      let zsti_users_flat: Array<{ imie: string, nazwisko: string }> = this.zsti_users[0].imie.map((imie, index) => {
        return { imie, nazwisko: this.zsti_users[0].nazwisko[index] };
      });
      zsti_users_flat.sort((a, b) => a.nazwisko.localeCompare(b.nazwisko));
      this.sorted_zsti_users = zsti_users_flat;
    }
  });

  this.dataService.StudentListInternatData.subscribe((data: any) => {
    this.StudentListInternatData = data;
    if (this.StudentListInternatData != null) {
      this.internat_users[0].imie = this.StudentListInternatData.map((element: any) => element.imie);
      this.internat_users[0].nazwisko = this.StudentListInternatData.map((element: any) => element.nazwisko);
      let internat_users_flat: Array<{ imie: string, nazwisko: string }> = this.internat_users[0].imie.map((imie, index) => {
        return { imie, nazwisko: this.internat_users[0].nazwisko[index] };
      });
      internat_users_flat.sort((a, b) => a.nazwisko.localeCompare(b.nazwisko));
      this.sorted_internat_users = internat_users_flat;
    }
});
  }
  szukaj() : void {
    const searchTerm = this.el.nativeElement.querySelector('#wyszukaj > input').value.toLowerCase();
    const sections = this.DOMelement.querySelectorAll('section > ol > li');
    sections.forEach((element: HTMLElement) => {
      element.style.display = element.textContent?.toLowerCase().includes(searchTerm) ? 'block' : 'none';
    });
    if (searchTerm === '') {
      sections.forEach((element: HTMLElement) => {
        element.style.display = 'block';
      });
    } else {
      this.rozwin(new Event('click'));
      this.rozwin(new Event('click'));
    }
}
  cantDoThat(func:Function) {
    const dialogRef = this.dialog?.open(UnsavedChangesDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'proceed') {
        this.dataService.SavedList.forEach((element:any) => {
          element.next(true)
        })
        func();
      }
    });
  }

  osoba : string | undefined;
  title: string = 'panel_administracyjny';
  typ : string | undefined;
  show(event: Event): void {
    if (this.dataService.SavedList.some(element => !element.value)) {
      this.cantDoThat(() => this.show(event));
      return;
    }
    let target = event.target as HTMLElement;
    if (target.tagName === 'OL') return;
    if (target.tagName === 'SPAN') {
      target = target.parentElement as HTMLElement;
    }
    this.DOMelement.querySelector('app-globalny-panel').style.display = 'none';
    this.DOMelement.querySelector('app-panel').style.display = 'block';
    this.osoba = target.querySelector('span')?.textContent!;
    const index = parseInt(target.getAttribute('data-index')!, 10);
    const studentData = this.typ === 'ZSTI' ? this.StudentListZstiData : this.StudentListInternatData;
    if (studentData && studentData[index] && this.typ) {
      this.dataService.changeStudent(studentData[index].id, this.typ);
    }
  }
  rozwin(event: Event): void {
    let target = event.target as HTMLElement;
    while (target.tagName !== 'BUTTON') {
      target = target.parentElement as HTMLElement;
    }
    const img = target.querySelector('img') as HTMLElement;
    const ol = target.nextElementSibling as HTMLElement;
    if (!ol) return;
    ol.classList.toggle('show');
    img.classList.toggle('rotate');
  }
  protected readonly JSON : JSON = JSON;
  main_menu() : void {
    this.DOMelement.querySelector('app-globalny-panel').style.display = 'block';
    this.DOMelement.querySelector('app-panel').style.display = 'none';
  }
}
