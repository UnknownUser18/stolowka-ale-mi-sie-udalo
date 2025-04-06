import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalnyRaportComponent } from './globalny-raport.component';

describe('GlobalnyRaportComponent', () => {
  let component: GlobalnyRaportComponent;
  let fixture: ComponentFixture<GlobalnyRaportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalnyRaportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalnyRaportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
