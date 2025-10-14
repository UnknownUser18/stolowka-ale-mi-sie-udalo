import { Pipe, PipeTransform } from '@angular/core';
import { ZDeclaration } from "@database/declarations.service";

@Pipe({
  name : 'dayInMoreDeclarations'
})
export class DayInMoreDeclarationsPipe implements PipeTransform {

  transform(value : Date, declarations? : ZDeclaration[] | null) : boolean {
    if (!declarations || declarations.length === 0) return false;

    const overlappingDeclarations = declarations.filter(declaration => {
      return value >= declaration.data_od && value <= declaration.data_do;
    });

    return overlappingDeclarations.length > 1;
  }

}
