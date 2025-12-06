import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nieczynne } from './nieczynne';

describe('NieczynneComponent', () => {
  let component : Nieczynne;
  let fixture : ComponentFixture<Nieczynne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Nieczynne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nieczynne);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
