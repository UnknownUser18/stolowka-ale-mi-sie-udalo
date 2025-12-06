import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Platnosci } from './platnosci';

describe('PlatnosciComponent', () => {
  let component : Platnosci;
  let fixture : ComponentFixture<Platnosci>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Platnosci]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Platnosci);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
