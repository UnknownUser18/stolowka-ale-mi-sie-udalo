import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector      : 'table[table-default]',
  imports       : [],
  templateUrl   : './table.html',
  styleUrl      : './table.scss',
  encapsulation : ViewEncapsulation.None,
})
export class Table {
  constructor() {}
}
