import { Pipe, PipeTransform } from '@angular/core';
import { LocalAbsenceChanges, ZAbsenceDay } from '@database/declarations/declarations';

@Pipe({
  name : 'isAbsence'
})
export class IsAbsencePipe implements PipeTransform {

  transform(day : Date | null, absenceDays : ZAbsenceDay[] | null | undefined, localAbsence : LocalAbsenceChanges) : boolean {
    if (!day || !absenceDays) return false;
    return absenceDays.some(d => {
      const isSameDay = d.dzien_wypisania.toDateString() === day.toDateString();
      const isLocallyRemoved = localAbsence.removed.some(r => new Date(r).toDateString() === day.toDateString());
      const isLocallyAdded = localAbsence.added.some(a => new Date(a).toDateString() === day.toDateString());
      return isSameDay && !isLocallyRemoved || isLocallyAdded;
    });
  }

}
