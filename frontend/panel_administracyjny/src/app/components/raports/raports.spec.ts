import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Raports } from './raports';

describe('RaportsComponent', () => {
  let component : Raports;
  let fixture : ComponentFixture<Raports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Raports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Raports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
