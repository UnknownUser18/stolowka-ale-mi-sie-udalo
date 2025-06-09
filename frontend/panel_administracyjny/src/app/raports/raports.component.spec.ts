import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaportsComponent } from './raports.component';

describe('RaportsComponent', () => {
  let component: RaportsComponent;
  let fixture: ComponentFixture<RaportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
