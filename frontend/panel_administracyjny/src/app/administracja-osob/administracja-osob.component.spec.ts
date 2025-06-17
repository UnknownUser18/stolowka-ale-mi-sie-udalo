import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracjaOsobComponent } from './administracja-osob.component';

describe('AdministracjaOsobComponent', () => {
  let component: AdministracjaOsobComponent;
  let fixture: ComponentFixture<AdministracjaOsobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracjaOsobComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministracjaOsobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
