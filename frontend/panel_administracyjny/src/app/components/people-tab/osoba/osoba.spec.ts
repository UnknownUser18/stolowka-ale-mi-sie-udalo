import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Osoba } from './osoba';

describe('OsobaComponent', () => {
  let component : Osoba;
  let fixture : ComponentFixture<Osoba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Osoba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Osoba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
