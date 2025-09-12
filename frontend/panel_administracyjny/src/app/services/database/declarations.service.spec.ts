import { TestBed } from '@angular/core/testing';

import { DeclarationsService } from './declarations.service';

describe('DeclarationsService', () => {
  let service: DeclarationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeclarationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
