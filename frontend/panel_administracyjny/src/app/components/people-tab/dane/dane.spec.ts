import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dane } from './dane';

describe('DaneComponent', () => {
  let component : Dane;
  let fixture : ComponentFixture<Dane>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Dane]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dane);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
