import { TestBed } from '@angular/core/testing';

import { Declarations } from './declarations';

describe('DeclarationsService', () => {
  let service : Declarations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Declarations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
