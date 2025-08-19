import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsobyNavComponent } from './osoby-nav.component';

describe('OsobyNavComponent', () => {
  let component: OsobyNavComponent;
  let fixture: ComponentFixture<OsobyNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsobyNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsobyNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
