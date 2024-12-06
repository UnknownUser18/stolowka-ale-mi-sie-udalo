import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeklaracjeComponent } from './deklaracje.component';

describe('DeklaracjeComponent', () => {
  let component: DeklaracjeComponent;
  let fixture: ComponentFixture<DeklaracjeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeklaracjeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeklaracjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
