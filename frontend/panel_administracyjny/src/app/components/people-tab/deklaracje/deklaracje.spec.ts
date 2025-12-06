import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Deklaracje } from './deklaracje';

describe('DeklaracjeComponent', () => {
  let component : Deklaracje;
  let fixture : ComponentFixture<Deklaracje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Deklaracje]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Deklaracje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
