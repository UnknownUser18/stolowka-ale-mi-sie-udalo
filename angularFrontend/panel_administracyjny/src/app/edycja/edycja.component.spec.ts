import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdycjaComponent } from './edycja.component';

describe('EdycjaComponent', () => {
  let component: EdycjaComponent;
  let fixture: ComponentFixture<EdycjaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdycjaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdycjaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
