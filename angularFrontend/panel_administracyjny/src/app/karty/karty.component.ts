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
  isFocused:boolean = false;
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
    this.dataService.CurrentStudentCardInternat.asObservable().subscribe((change:any)=>this.updateCard(change))
    this.todayString = `${this.today.getFullYear()}-${this.today.getMonth()+1}-${this.today.getDate()}`;
    this.nullKarta = {
      id: -1,
      id_ucznia: -1,
      key_card: -1,
      data_wydania: '',
      ostatnie_uzycie: ''
    }
  }

  updateCard(change:any)
  {
    console.log("Karta pierwsza zmiana" + this.CurrentKarta, change)
    if(typeof change != 'object' || change.id === -1)
    {
      console.log("Null karta!")
      this.CurrentKarta = this.nullKarta;
      this.clearData();
      return
    }
    this.CurrentKarta = change;
      let dateBegin = new Date(this.CurrentKarta.data_wydania)
      this.CurrentKarta.data_wydania = `${dateBegin.getFullYear()}-${dateBegin.getMonth() + 1}-${dateBegin.getDate()}`
      let lastUse = new Date(this.CurrentKarta.ostatnie_uzycie)
      this.CurrentKarta.ostatnie_uzycie = `${lastUse.getFullYear()}-${lastUse.getMonth() + 1}-${lastUse.getDate()}`
    console.log("Karta" + this.CurrentKarta, change)
    this.showCardInformation();
  }


  showCardInformation()
  {
    if(this.CurrentKarta === this.nullKarta)
    {
      this.el.nativeElement.querySelector('input[name="key_card"]').value = '';
      this.el.nativeElement.querySelector('input[name="data_wydania"]').value = ''
      this.el.nativeElement.querySelector('input[name="ostatnie_uzycie"]').value = ''
      return
    }
    console.log("not null karta")
    this.el.nativeElement.querySelector('input[name="key_card"]').value = this.CurrentKarta.key_card;
    this.el.nativeElement.querySelector('input[name="data_wydania"]').value = this.CurrentKarta.data_wydania
    this.el.nativeElement.querySelector('input[name="ostatnie_uzycie"]').value = this.CurrentKarta.ostatnie_uzycie
  }

  clearData()
  {
    this.el.nativeElement.querySelector('input[name="key_card"]').value = '';
    this.el.nativeElement.querySelector('input[name="data_wydania"]').value = '';
    this.el.nativeElement.querySelector('input[name="ostatnie_uzycie"]').value = '';
  }

  generateRandomKeyCard(event: Event | null):any
  {
    let max = 0x10000;
    let min = 0x400;
    let value = Math.floor(Math.random() * (max - min) + max);
    if(this.dataService.CardsZsti.value.find((element:any) => element.key_card == value))
      return this.generateRandomKeyCard(null);
    if(this.dataService.CardsInternat.value.find((element:any) => element.key_card == value))
      return this.generateRandomKeyCard(null);
    this.el.nativeElement.querySelector('input[name="card-amount-edit"]').value = value;
    return true;
  }

  deleteCard()
  {
    let method = "DeleteKartyZsti"
    if(this.dataService.StudentType.value === 'Internat')
      method = 'DeleteKartyInternat';
    this.dataService.send(JSON.stringify(
      {
        action: "request",
        params: {
          method: method,
          id: this.CurrentKarta.id
        }
      }
    ))
    console.log("Delete card: ", this.dataService.StudentType.value, method)
    if(this.dataService.StudentType.value === 'ZSTI')
    {
      this.dataService.getCardsZsti();
      console.log("GetCardsZsti()");
    }

    else if (this.dataService.StudentType.value === 'Internat')
    {
      this.dataService.getCardsInternat();
      console.log("GetCardsInternat()");
    }
  }

  dodajKarte()
  {

    let method = 'addKartyInternat'
    if(this.dataService.StudentType.value === 'ZSTI')
       method = 'addKartyZsti'
    let tempCard = JSON.parse(JSON.stringify(this.nullKarta));
    tempCard.id_ucznia = this.dataService.CurrentStudentId.value;
    tempCard.key_card = parseInt(this.el.nativeElement.querySelector('input[name="card-amount-edit"]').value);
    tempCard.data_wydania = this.el.nativeElement.querySelector('input[name="card-date-release"]').value;
    if(this.dataService.CardsZsti.value.find((element:any) => element.key_card == tempCard.key_card) || this.dataService.CardsInternat.value.find((element:any) => element.key_card == tempCard.key_card))
    {
      alert("JUZ ISTNIEJE!")
      return
    }
    console.log(tempCard)
    this.dataService.send(JSON.stringify({
      action: "request",
      params: {
        method: method,
        studentId: tempCard.id_ucznia,
        keyCard: tempCard.key_card,
        beginDate: tempCard.data_wydania,
        lastUse: null
      }
    }))
    console.log("Add student card: ", tempCard)
    if(this.dataService.StudentType.value === 'ZSTI')
      this.dataService.getCardsZsti();
    else
      this.dataService.getCardsInternat();
    this.closeCard();
  }


  dodajPlatnosc()
  {
    console.log("Before karta")
    console.log("jak wyglada karta: ", this.CurrentKarta)
    if(this.CurrentKarta === this.nullKarta)
    {
      this.el.nativeElement.querySelector('#dodaj_karte').style.display = 'flex';
      this.el.nativeElement.querySelector('input[name="card-amount-edit"]').focus()
      return
    }
    alert("Ta osoba posiada już kartę!")
    this.isFocused = true;
  }

  closeCard()
  {
    this.el.nativeElement.querySelector('#dodaj_karte').style.display = 'none';
    this.isFocused = false;
    this.el.nativeElement.querySelector('input[name="card-amount-edit"]').unfocus()
  }

}
