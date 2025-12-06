import { Pipe, PipeTransform } from '@angular/core';
import { ZDeclaration } from "@database/declarations/declarations";

@Pipe({
  name : 'isSelectedDeclaration'
})
export class IsSelectedDeclarationPipe implements PipeTransform {

  transform(value : ZDeclaration, declaration : ZDeclaration | null) : boolean {
    if (!declaration) return false;

    return value.id === declaration.id;
  }
}
