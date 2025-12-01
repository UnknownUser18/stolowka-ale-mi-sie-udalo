import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeNavComponent } from './home-nav.component';

describe('HomeNavComponent', () => {
  let component: HomeNavComponent;
  let fixture: ComponentFixture<HomeNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
