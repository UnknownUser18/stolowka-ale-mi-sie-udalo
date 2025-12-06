import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Karty } from './karty';

describe('KartyComponent', () => {
  let component : Karty;
  let fixture : ComponentFixture<Karty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Karty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Karty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
