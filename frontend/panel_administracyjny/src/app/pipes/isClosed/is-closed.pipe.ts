import { Pipe, PipeTransform } from '@angular/core';
import { ClosedDay } from '@database/declarations/declarations';

@Pipe({
  name: 'isClosed'
})
export class IsClosedPipe implements PipeTransform {

  transform(date : Date, closedDay? : ClosedDay[] | null): unknown {
    if (!closedDay) return false;
    return closedDay.some(d => {
      return d.dzien.toDateString() === date.toDateString();
    });
  }

}
