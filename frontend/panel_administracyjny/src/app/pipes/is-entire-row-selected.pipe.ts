import { inject, Pipe, PipeTransform } from '@angular/core';
import { ZAbsenceDay, ZDeclaration } from '@database/declarations.service';
import { PersonsService } from '@database/persons.service';

@Pipe({
  name : 'isEntireRowSelected',
})
export class IsEntireRowSelectedPipe implements PipeTransform {
  private personS = inject(PersonsService);


  transform(days : (Date | null)[], absenceDays? : ZAbsenceDay[] | null, declaration? : ZDeclaration[] | null) : any {
    let selectedDays = 0;

    const isDayInDeclaration = (day : Date) => {
      return declaration?.some(declaration => {
        const day_date = day.getDay();
        if (day_date === 0 || day_date === 6) return false;

        const bit = declaration.dni.charAt(day_date - 1);
        if (bit !== '1') return false;

        return day >= declaration.data_od && day <= declaration.data_do;
      });
    }

    const isDaySelected = (date : Date) : boolean => {
      const isLocallyAdded = this.personS.localAbsenceChanges().findAdded(date)
      const isInDatabase = !!absenceDays?.some(d => d.dzien_wypisania.toDateString() === date.toDateString());
      const isLocallyRemoved = this.personS.localAbsenceChanges().findRemoved(date);
      return isLocallyAdded || (isInDatabase && !isLocallyRemoved);
    }

    for (const day of days) {
      if (!day || !isDayInDeclaration(day)) continue;
      if (!isDaySelected(day)) return false;
      selectedDays++;
    }

    return selectedDays !== 0; // true only if at least one day is selected and can be selected
  }

}
