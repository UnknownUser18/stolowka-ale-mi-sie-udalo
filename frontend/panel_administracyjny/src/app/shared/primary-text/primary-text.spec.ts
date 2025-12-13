import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryText } from '@ui';

describe('PrimaryText', () => {
  let component : PrimaryText;
  let fixture : ComponentFixture<PrimaryText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [PrimaryText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimaryText);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
