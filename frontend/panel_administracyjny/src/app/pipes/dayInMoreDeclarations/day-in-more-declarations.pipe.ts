import { Pipe, PipeTransform } from '@angular/core';
import { ZDeclaration } from "@database/declarations/declarations";
import { ZPricing } from "@database/prices/prices";

@Pipe({
  name : 'dayInMoreDeclarations'
})
export class DayInMoreDeclarationsPipe implements PipeTransform {

  transform(value : Date, elements? : ZDeclaration[] | Omit<ZPricing, 'cena'>[] | null) : boolean {
    if (!elements || elements.length === 0) return false;

    const overLappingElements = elements.filter(element => {
      return value >= element.data_od && value <= element.data_do;
    });

    return overLappingElements.length > 1;
  }

}
