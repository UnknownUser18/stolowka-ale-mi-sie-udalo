import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaneComponent } from './dane.component';

describe('DaneComponent', () => {
  let component: DaneComponent;
  let fixture: ComponentFixture<DaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
