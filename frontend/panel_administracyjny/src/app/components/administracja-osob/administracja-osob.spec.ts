import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracjaOsob } from './administracja-osob';

describe('AdministracjaOsobComponent', () => {
  let component : AdministracjaOsob;
  let fixture : ComponentFixture<AdministracjaOsob>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [AdministracjaOsob]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministracjaOsob);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
