import { TestBed } from '@angular/core/testing';

import { TooltipRegistryService } from './tooltip-registry.service';

describe('TooltipRegistryService', () => {
  let service: TooltipRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TooltipRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
