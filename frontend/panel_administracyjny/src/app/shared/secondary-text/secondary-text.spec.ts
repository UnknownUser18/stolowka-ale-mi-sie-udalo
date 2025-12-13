import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryText } from '@ui';

describe('SecondaryText', () => {
  let component : SecondaryText;
  let fixture : ComponentFixture<SecondaryText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [SecondaryText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecondaryText);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
