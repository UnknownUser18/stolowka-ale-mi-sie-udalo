import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelOneLine } from '@ui';

describe('LabelOneLine', () => {
  let component : LabelOneLine;
  let fixture : ComponentFixture<LabelOneLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [LabelOneLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelOneLine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
