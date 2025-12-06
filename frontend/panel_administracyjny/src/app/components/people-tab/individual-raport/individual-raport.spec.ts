import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualRaport } from './individual-raport';

describe('IndividualRaportComponent', () => {
  let component : IndividualRaport;
  let fixture : ComponentFixture<IndividualRaport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [IndividualRaport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualRaport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
