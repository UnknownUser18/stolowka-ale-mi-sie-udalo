import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cennik } from './cennik';

describe('CennikComponent', () => {
  let component : Cennik;
  let fixture : ComponentFixture<Cennik>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Cennik]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cennik);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
