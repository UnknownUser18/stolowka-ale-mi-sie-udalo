import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsobyNav } from './osoby-nav';

describe('OsobyNavComponent', () => {
  let component : OsobyNav;
  let fixture : ComponentFixture<OsobyNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [OsobyNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsobyNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
