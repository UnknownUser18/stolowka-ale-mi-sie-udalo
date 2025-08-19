import { CanActivateChildFn } from '@angular/router';

export const mainGuard: CanActivateChildFn = (childRoute, state) => {
  return true;
};
