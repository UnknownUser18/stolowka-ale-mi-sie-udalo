import { TestBed } from '@angular/core/testing';

import { Guardians } from './guardians';

describe('GuardiansService', () => {
  let service : Guardians;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Guardians);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
