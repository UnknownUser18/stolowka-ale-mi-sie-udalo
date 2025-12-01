import { Pipe, PipeTransform } from '@angular/core';
import { ZDeclaration } from '@database/declarations.service';
import { ZPricing } from "@database/prices.service";

@Pipe({
  name : 'inDeclaration',
  standalone : true
})
export class InDeclarationPipe implements PipeTransform {

  transform(day : Date | null, declarations : ZDeclaration[] | Omit<ZPricing, 'cena'>[] | null | undefined, withDay = false) : boolean {
    if (!day || !declarations) return false;
    if (withDay)
      return declarations.some(d => d.data_od <= day && d.data_do >= day && (d as ZDeclaration).dni.split('')[day.getDay() - 1] === '1');
    else
      return declarations.some(d => d.data_od <= day && d.data_do >= day);
  }
}

