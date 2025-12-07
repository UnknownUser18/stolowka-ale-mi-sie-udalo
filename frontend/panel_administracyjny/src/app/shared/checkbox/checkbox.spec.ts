import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Checkbox } from '@ui';

describe('Checkbox', () => {
  let component : Checkbox;
  let fixture : ComponentFixture<Checkbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Checkbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Checkbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
