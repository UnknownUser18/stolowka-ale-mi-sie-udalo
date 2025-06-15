import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualRaportComponent } from './individual-raport.component';

describe('IndividualRaportComponent', () => {
  let component: IndividualRaportComponent;
  let fixture: ComponentFixture<IndividualRaportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualRaportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualRaportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
