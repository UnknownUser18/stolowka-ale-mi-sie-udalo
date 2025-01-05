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
  szukaj() {
    const searchTerm = this.el.nativeElement.querySelector('#wyszukaj > input').value.toLowerCase();
    if(searchTerm === '') {
      this.DOMelement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      this.DOMelement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      return;
    }
    this.rozwin(this.DOMelement.querySelector('section:nth-of-type(1) > button'), 3, true);
    this.rozwin(this.DOMelement.querySelector('section:nth-of-type(2) > button'), 4, true);
    this.DOMelement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
      !element.textContent?.toLowerCase().includes(searchTerm) ? element.style.display = 'none' : element.style.display = 'block';
    })
    this.el.nativeElement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
      !element.textContent?.toLowerCase().includes(searchTerm) ? element.style.display = 'none' : element.style.display = 'block';
    })
  }
  cantDoThat(func:Function)
  {
    const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
      width: '400px',
    });
    // Obsługa zamknięcia dialogu
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'proceed') {
        console.log('Użytkownik zdecydował się kontynuować mimo niezapisanych zmian.');
        this.dataService.SavedList.forEach((element:any) => {
          element.next(true)
        })
        func();
      } else {
        console.log('Użytkownik anulował akcję.');
      }
      console.log(this.dataService.SavedList)
    });
  }

  osoba : string | undefined;
  title: string = 'panel_administracyjny';
  typ : string | undefined;
  show(event: Event) {
    let ifRet = false
    this.dataService.SavedList.forEach((element)=>{
      if(!element.value)
        ifRet = true
    })
    let func = () => {
      let target = event.target as HTMLElement;
      if(target.tagName != 'OL') {
        if(target.tagName == "SPAN") {
          target = target.parentElement as HTMLElement;
        }
        this.DOMelement.querySelector('app-globalny-panel').style.display = 'none';
        this.DOMelement.querySelector('app-panel').style.display = 'block';
        let daneTarget = target;
        this.osoba = target.querySelector('span')?.textContent!;
        target = target.parentElement as HTMLElement;
        target = target.parentElement as HTMLElement;
        target = target.querySelector('button') as HTMLElement;
        this.typ = target.textContent!;
        // @ts-ignore
        if(!this.StudentListZstiData[daneTarget.getAttribute('data-index')]) return
        const index : number = parseInt(daneTarget.getAttribute('data-index')!, 10);
        if (this.typ === "ZSTI") {
          if (this.StudentListZstiData && this.StudentListZstiData[index]) this.dataService.changeStudent(this.StudentListZstiData[index].id, this.typ);
        } else {
          if (this.StudentListInternatData && this.StudentListInternatData[index]) this.dataService.changeStudent(this.StudentListInternatData[index].id, this.typ);
        }
      }
    }
    if(ifRet) {
      this.cantDoThat(func)
      return;
    }
    func()
  }
  rozwin(event: Event, number: number, szukaj : boolean) {
    let target = szukaj ? event : (event.target as HTMLElement);
    // @ts-ignore
    target = target.parentElement as HTMLElement;
    target = target.parentElement as HTMLElement;
    let img = target.querySelector(`:nth-child(${number}) > button img`) as HTMLElement;
    target = target.querySelector(`:nth-child(${number}) > ol`) as HTMLElement;
    if(target.style.opacity === '1' && !szukaj) {
      target.style.opacity = '0';
      target.style.maxHeight = '0';
      target.style.overflow = 'hidden';
      img.classList.remove('rotate');
      return;
    }
    else {
      target.style.opacity = '1';
      target.style.maxHeight = 'fit-content';
      target.style.overflow = 'visible';
      img.classList.add('rotate');
    }
  }
  protected readonly JSON = JSON;
  main_menu() {
    this.DOMelement.querySelector('app-globalny-panel').style.display = 'block';
    this.DOMelement.querySelector('app-panel').style.display = 'none';
  }
}
