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
export class AppComponent implements OnInit{
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
  StudentListZstiData:any = null;
  StudentListInternatData:any = null;
  constructor(private dataService:DataBaseService, private el: ElementRef, private dialog: MatDialog) {
  }
  ngOnInit() {
    this.dataService.StudentListZstiData.subscribe((data: any) => {
      this.StudentListZstiData = data;
      if(this.StudentListZstiData != null) {
        this.zsti_users[0].imie = this.StudentListZstiData.map((element: any) => element.imie.toLowerCase());
        this.zsti_users[0].nazwisko = this.StudentListZstiData.map((element: any) => element.nazwisko.toLowerCase());
      }
    });
    this.dataService.StudentListInternatData.subscribe((data: any) => {
      this.StudentListInternatData = data;
      if(this.StudentListInternatData != null) {
        this.internat_users[0].imie = this.StudentListInternatData.map((element: any) => element.imie.toLowerCase());
        this.internat_users[0].nazwisko = this.StudentListInternatData.map((element: any) => element.nazwisko.toLowerCase());
      }
    });
  }
  szukaj() {
    const searchTerm = this.el.nativeElement.querySelector('#wyszukaj > input').value.toLowerCase();
    if(searchTerm === '') {
      this.el.nativeElement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      this.el.nativeElement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      return;
    }
    this.rozwin(this.el.nativeElement.querySelector('section:nth-of-type(1) > button'), 3, true);
    this.rozwin(this.el.nativeElement.querySelector('section:nth-of-type(2) > button'), 4, true);
    this.el.nativeElement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
      if(!element.textContent?.toLowerCase().includes(searchTerm)) {
        element.style.display = 'none';
      }
      else {
        element.style.display = 'block';
      }
    })
    this.el.nativeElement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
      if(!element.textContent?.toLowerCase().includes(searchTerm)) {
        element.style.display = 'none';
      }
      else {
        element.style.display = 'block';
      }
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
    let func = () =>
    {
      let target = event.target as HTMLElement;
      if(target.tagName != 'OL') {
        if(target.tagName == "SPAN") {
          target = target.parentElement as HTMLElement;
        }
        this.el.nativeElement.querySelector('app-globalny-panel').style.display = 'none';
        let daneTarget = target;
        this.osoba = target.querySelector('span')?.textContent!;
        target = target.parentElement as HTMLElement;
        target = target.parentElement as HTMLElement;
        target = target.querySelector('button') as HTMLElement;
        this.typ = target.textContent!;
        // @ts-ignore
        if(!this.StudentListZstiData[daneTarget.getAttribute('data-index')])
          return
        if(this.typ === "ZSTI") {
          this.dataService.changeStudent(this.StudentListZstiData[daneTarget.getAttribute('data-index')!].id, this.typ)
        }
        else {
          this.dataService.changeStudent(this.StudentListInternatData[daneTarget.getAttribute('data-index')!].id, this.typ)
        }
      }
    }
    if(ifRet)
    {
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
    this.el.nativeElement.querySelector('app-globalny-panel').style.display = 'block';
    this.el.nativeElement.querySelector('app-panel').style.display = 'none';
    // żydon zrób żeby usunąc zaznaczoną osobę po tym kliknięciu ^
  }
}
