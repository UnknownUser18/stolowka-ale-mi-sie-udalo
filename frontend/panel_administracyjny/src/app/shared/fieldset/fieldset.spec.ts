import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fieldset } from '@ui';

describe('Fieldset', () => {
  let component : Fieldset;
  let fixture : ComponentFixture<Fieldset>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Fieldset]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fieldset);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
