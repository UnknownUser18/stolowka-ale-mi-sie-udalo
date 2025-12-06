import { TestBed } from '@angular/core/testing';

import { Types } from './types';

describe('TypesService', () => {
  let service : Types;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Types);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
