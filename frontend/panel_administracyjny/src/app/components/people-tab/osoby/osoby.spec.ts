import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Osoby } from './osoby';

describe('OsobyComponent', () => {
  let component : Osoby;
  let fixture : ComponentFixture<Osoby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Osoby]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Osoby);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
