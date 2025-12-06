import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeNav } from './home-nav';

describe('HomeNavComponent', () => {
  let component : HomeNav;
  let fixture : ComponentFixture<HomeNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [HomeNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
