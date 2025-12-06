import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Zsti } from './zsti';

describe('ZstiComponent', () => {
  let component : Zsti;
  let fixture : ComponentFixture<Zsti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [Zsti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Zsti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
