import { TestBed } from '@angular/core/testing';

import { Info } from './info';

describe('InfoService', () => {
  let service : Info;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Info);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
