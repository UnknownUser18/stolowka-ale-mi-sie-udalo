import {Component, ElementRef, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataBaseService} from '../data-base.service';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {CardDisplayComponent} from '../card-display/card-display.component';

@Component({
  selector: 'app-karty',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgOptimizedImage,
    CardDisplayComponent,
    NgIf
  ],
  templateUrl: './karty.component.html',
  styleUrl: './karty.component.css'
})
export class KartyComponent {
  @Input() typ: string | undefined;
  today:Date = new Date();
  todayString:string;
  CurrentKarta: { id: number, id_ucznia:number, key_card:number, data_wydania:string, ostatnie_uzycie:string } =
      {
        id:-1,
        id_ucznia:-1,
        key_card:-1,
        data_wydania: '',
        ostatnie_uzycie: ''
      }
  nullKarta: { id: number, id_ucznia:number, key_card:number, data_wydania:string, ostatnie_uzycie:string } =
      {
        id:-1,
        id_ucznia:-1,
        key_card:-1,
        data_wydania: '',
        ostatnie_uzycie: ''
      }
  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.CurrentStudentCardZsti.asObservable().subscribe((change:any)=>this.updateCard(change))
    this.todayString = `${this.today.getFullYear()}-${this.today.getMonth()+1}-${this.today.getDate()}`;
  }
  updateCard(change:any)
  {
    console.log( "NIGERS Karta" + this.CurrentKarta, change)
    if(!change)
    {
      this.clearData();
      return
    }
    this.CurrentKarta = change;
    let dateBegin = new Date(this.CurrentKarta.data_wydania)
    let lastUse = new Date(this.CurrentKarta.ostatnie_uzycie)
    this.CurrentKarta.data_wydania = `${dateBegin.getFullYear()}-${dateBegin.getMonth() + 1}-${dateBegin.getDate()}`
    this.CurrentKarta.ostatnie_uzycie = `${lastUse.getFullYear()}-${lastUse.getMonth() + 1}-${lastUse.getDate()}`
    console.log( "NIGERS Karta" + this.CurrentKarta, change)
    this.showCardInformation();
  }


  showCardInformation()
  {
    this.el.nativeElement.querySelector('input[name="key_card"]').value = this.CurrentKarta.key_card;
    this.el.nativeElement.querySelector('input[name="data_wydania"]').value = this.CurrentKarta.data_wydania
    this.el.nativeElement.querySelector('input[name="ostatnie_uzycie"]').value = this.CurrentKarta.ostatnie_uzycie
  }

  clearData()
  {
    this.el.nativeElement.querySelector('input[name="key_card"]').value = null;
    this.el.nativeElement.querySelector('input[name="data_wydania"]').value = '';
    this.el.nativeElement.querySelector('input[name="ostatnie_uzycie"]').value = '';
  }

  generateRandomKeyCard(event: Event | null)
  {
    let max = 0x10000;
    let min = 0x400;
    this.el.nativeElement.querySelector('input[name="card-amount-edit"]').value = Math.floor(Math.random() * (0x10000 - 0x400) + 0x400);
  }

  deleteCard()
  {
    this.dataService.send(JSON.stringify(
      {
        action: "request",
        params: {
          method: "DeleteKartyZsti",
          id: this.CurrentKarta.id
        }
      }
    ))
    this.dataService.getCardsZsti()
  }

  dodajPlatnosc()
  {
    this.el.nativeElement.querySelector('#dodaj_karte').style.display = 'flex';
  }

  closeCard()
  {
    this.el.nativeElement.querySelector('#dodaj_karte').style.display = 'none';
  }

}
