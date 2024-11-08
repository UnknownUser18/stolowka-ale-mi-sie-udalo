import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalnyPanelComponent } from './globalny-panel.component';

describe('GlobalnyPanelComponent', () => {
  let component: GlobalnyPanelComponent;
  let fixture: ComponentFixture<GlobalnyPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalnyPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalnyPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
