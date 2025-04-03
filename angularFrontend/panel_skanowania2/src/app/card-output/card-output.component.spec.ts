import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOutputComponent } from './card-output.component';

describe('CardOutputComponent', () => {
  let component: CardOutputComponent;
  let fixture: ComponentFixture<CardOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOutputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
