import { Pipe, PipeTransform } from '@angular/core';
import { ZPayment } from "@database/payments.service";

@Pipe({
  name : 'isSelectedPayment'
})
export class IsSelectedPaymentPipe implements PipeTransform {

  transform(payment : ZPayment, selectedPayment : ZPayment | null) : boolean {
    if (!selectedPayment) return false;
    return payment.id === selectedPayment.id;
  }
}
