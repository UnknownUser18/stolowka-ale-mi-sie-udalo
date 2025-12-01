import { Pipe, PipeTransform } from '@angular/core';
import { ZDeclaration } from "@database/declarations.service";
import { ZPricing } from "@database/prices.service";

@Pipe({
  name : 'dayInDeclaration'
})
export class DayInDeclarationPipe implements PipeTransform {

  transform(value : Date, selectedDeclaration : ZDeclaration | Omit<ZPricing, 'cena'> | null) : boolean {
    if (!selectedDeclaration) return false;

    return selectedDeclaration.data_od <= value && selectedDeclaration.data_do >= value;
  }
}