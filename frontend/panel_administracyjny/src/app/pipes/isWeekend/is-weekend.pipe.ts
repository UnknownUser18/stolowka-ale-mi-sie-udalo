import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name : 'isWeekend'
})
export class IsWeekendPipe implements PipeTransform {

  transform(day : Date | null) : boolean {
    if (!day) return false;
    const dayOfWeek = day.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
}
