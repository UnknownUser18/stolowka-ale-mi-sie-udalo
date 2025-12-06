import { Pipe, PipeTransform } from '@angular/core';
import { ZPricing } from "@database/prices/prices";

@Pipe({
  name : 'isSelectedPrice'
})
export class IsSelectedPricePipe implements PipeTransform {

  transform(price : ZPricing, selectedPrice : ZPricing | null) : boolean {
    if (!selectedPrice) return false;

    return price.id === selectedPrice.id;
  }
}
