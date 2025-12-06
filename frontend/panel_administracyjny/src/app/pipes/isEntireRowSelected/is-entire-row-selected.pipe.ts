import { inject, Pipe, PipeTransform } from '@angular/core';
import { ClosedDay, ZAbsenceDay, ZDeclaration } from '@database/declarations/declarations';
import { Persons } from '@database/persons/persons';

@Pipe({
  name : 'isEntireRowSelected',
})
export class IsEntireRowSelectedPipe implements PipeTransform {
  private personS = inject(Persons);


  transform(days : (Date | null)[], absenceDays? : ZAbsenceDay[] | null, declaration? : ZDeclaration[] | null, closedDays? : ClosedDay[] | null) : boolean {
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

    const isClosed = (date: Date) : boolean => {
      return !!closedDays?.some(d => d.dzien.toDateString() === date.toDateString());
    }

    const isDaySelected = (date : Date) : boolean => {
      const isLocallyAdded = this.personS.localAbsenceChanges().findAdded(date)
      const isInDatabase = !!absenceDays?.some(d => d.dzien_wypisania.toDateString() === date.toDateString());
      const isLocallyRemoved = this.personS.localAbsenceChanges().findRemoved(date);
      return isLocallyAdded || (isInDatabase && !isLocallyRemoved);
    }

    for (const day of days) {
      if (!day || !isDayInDeclaration(day) || isClosed(day)) continue;
      if (!isDaySelected(day)) return false;
      selectedDays++;
    }

    return selectedDays !== 0; // true only if at least one selectable day is selected
  }

}
