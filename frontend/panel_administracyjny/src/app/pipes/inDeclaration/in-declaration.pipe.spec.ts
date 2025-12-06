import { TestBed } from '@angular/core/testing';

import { InDeclarationPipe } from './in-declaration.pipe';

describe('InDeclarationPipe', () => {
  let pipe: InDeclarationPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.inject(InDeclarationPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
