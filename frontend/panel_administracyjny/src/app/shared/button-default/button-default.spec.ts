import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonDefault } from '%button-default';

describe('ButtonTertiary', () => {
  let component : ButtonDefault;
  let fixture : ComponentFixture<ButtonDefault>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [ButtonDefault]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonDefault);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
