import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateChanger } from './date-changer';

describe('DateChangerComponent', () => {
  let component : DateChanger;
  let fixture : ComponentFixture<DateChanger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [DateChanger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateChanger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
