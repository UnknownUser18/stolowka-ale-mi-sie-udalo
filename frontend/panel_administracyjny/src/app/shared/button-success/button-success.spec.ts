import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSuccess } from '%button-success';

describe('ButtonSuccess', () => {
  let component : ButtonSuccess;
  let fixture : ComponentFixture<ButtonSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [ButtonSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
