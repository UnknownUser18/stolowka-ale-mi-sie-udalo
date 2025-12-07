import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSecondary } from '@ui';

describe('ButtonSecondary', () => {
  let component : ButtonSecondary;
  let fixture : ComponentFixture<ButtonSecondary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [ButtonSecondary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonSecondary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
