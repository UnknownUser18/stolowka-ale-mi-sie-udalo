import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDanger } from '@ui';

describe('ButtonDanger', () => {
  let component : ButtonDanger;
  let fixture : ComponentFixture<ButtonDanger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [ButtonDanger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDanger);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
