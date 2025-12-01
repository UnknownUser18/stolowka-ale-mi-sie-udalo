import { TestBed } from '@angular/core/testing';

import { GuardiansService } from './guardians.service';

describe('GuardiansService', () => {
  let service: GuardiansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuardiansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
