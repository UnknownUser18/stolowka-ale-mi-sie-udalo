import { Component, OnInit, ElementRef } from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import { DataBaseService } from './data-base.service';
import { GlobalnyPanelComponent } from './globalny-panel/globalny-panel.component';
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
  DOMelement: HTMLElement | null;
  StudentListZstiData: Array<{ id: number, imie: string, nazwisko: string }> | null = null;
  StudentListInternatData: Array<{ id: number, imie: string, nazwisko: string }> | null = null;
  osoba: string | undefined;
  title: string = 'panel_administracyjny';
  typ: string | undefined;

  constructor(private dataService: DataBaseService, private el: ElementRef, private dialog: MatDialog) {
    this.DOMelement = this.el.nativeElement as HTMLElement | null;
  }

  ngOnInit() {
    this.dataService.StudentListZstiData.subscribe(data => this.updateUserList(data, 'ZSTI'));
    this.dataService.StudentListInternatData.subscribe(data => this.updateUserList(data, 'Internat'));
  }

  updateUserList(data: Array<{ id: number, imie: string, nazwisko: string }>, type: string) {
    this.typ = type; // to linijka zabrała mi 1 godzine na naprawnienie błędu 🦅🦅🦅🦅🦅🦅⭐⭐⭐🐷🍖🐻
    if (type === 'ZSTI') {
      this.StudentListZstiData = data;
    } else if(type === 'Internat') {
      this.StudentListInternatData = data;
    }
    else {
      console.error('Invalid type at updateUserList');
    }
  }

  szukaj() : void {
    const searchTerm : string = this.el.nativeElement.querySelector('#wyszukaj > input')?.value.toLowerCase() || '';
    const sections = this.DOMelement?.querySelectorAll('section > ol > li');
    sections?.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.display = htmlElement.textContent?.toLowerCase().includes(searchTerm) ? 'block' : 'none';
    });
    if (searchTerm === '') {
      sections?.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.display = 'block';
      });
    } else {
      this.rozwin(new Event('click'));
    }
  }

  cantDoThat(func: Function) {
    const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'proceed') {
        this.dataService.SavedList.forEach(element => element.next(true));
        func();
      }
    });
  }

  show(event: Event, typ : string | null): void {
    if(typ) this.typ = typ;
    if (this.dataService.SavedList.some(element => !element.value)) {
      this.cantDoThat(() => this.show(event, null));
      return;
    }
    let target = this.getEventTarget(event);
    if (target.tagName === 'OL') return;
    this.displayPanels(target);
    this.updateStudentData(target);
  }

  getEventTarget(event: Event): HTMLElement {
    let target = event.target as HTMLElement;
    if (target.tagName === 'SPAN') {
      target = target.parentElement as HTMLElement;
    }
    return target;
  }

  displayPanels(target: HTMLElement) {
    const globalnyPanel = this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement | null;
    const panel = this.DOMelement?.querySelector('app-panel') as HTMLElement | null;
    if (globalnyPanel) globalnyPanel.style.display = 'none';
    if (panel) panel.style.display = 'block';
    this.osoba = target.querySelector('span')?.textContent!;
  }

  updateStudentData(target: HTMLElement) {
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

  main_menu(): void {
    const globalnyPanel = this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement | null;
    const panel = this.DOMelement?.querySelector('app-panel') as HTMLElement | null;
    if (globalnyPanel) globalnyPanel.style.display = 'block';
    if (panel) panel.style.display = 'none';
  }
}
