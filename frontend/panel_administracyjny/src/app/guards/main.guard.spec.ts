import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { mainGuard } from './main.guard';

describe('mainGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => mainGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
