import { TestBed } from '@angular/core/testing';

import { LastPersons } from './last-persons';

describe('LastPersons', () => {
  let service : LastPersons;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastPersons);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
