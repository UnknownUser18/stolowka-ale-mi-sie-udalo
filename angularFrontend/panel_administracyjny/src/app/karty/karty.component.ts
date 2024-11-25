import {Component, ElementRef, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-karty',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './karty.component.html',
  styleUrl: './karty.component.css'
})
export class KartyComponent {
  @Input() typ: string | undefined;
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

  generateRandomKeyCard(event:Event)
  {
    let max = 0x10000;
    let min = 0x400;
    let val = Math.floor(Math.random() * (max-min)+min);
    ((event.target as HTMLElement).parentElement!.querySelector('input[name="key_card"]') as HTMLInputElement).value = String(val);
  }

}
