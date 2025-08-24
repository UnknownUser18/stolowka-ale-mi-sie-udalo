import { Injectable } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';

export type FieldOptions = 'required' | 'email' | 'min-length' | 'max-length' | 'pattern' | 'checkbox-required';

@Injectable({
  providedIn : 'root'
})
export class FormCreatorService {

  public createField(options? : FieldOptions[], minLength? : number, maxLength? : number, pattern? : string | RegExp, defaultValue? : any) : FormControl {
    let validators : ValidatorFn[] = [];
    if (options) {
      options.forEach((opt) => {
        switch (opt) {
          case "email":
            validators.push(Validators.email);
            break;
          case "required":
            validators.push(Validators.required);
            break;
          case "min-length":
            if (minLength) validators.push(Validators.minLength(minLength));
            else throw new Error('Min length not provided for min-length validator');
            break;
          case "max-length":
            if (maxLength) validators.push(Validators.maxLength(maxLength));
            else throw new Error('Max length not provided for max-length validator');
            break;
          case "pattern":
            if (pattern) validators.push(Validators.pattern(pattern));
            else throw new Error('Pattern not provided for pattern validator');
            break;
          case "checkbox-required":
            validators.push(Validators.requiredTrue);
            break;
          default:
            throw new Error(`Unknown validator option: ${ opt }`);
        }
      });
    }
    return new FormControl(defaultValue ?? '', validators);
  }
}
