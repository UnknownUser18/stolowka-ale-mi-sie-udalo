import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NieczynneComponent } from './nieczynne.component';

describe('NieczynneComponent', () => {
  let component: NieczynneComponent;
  let fixture: ComponentFixture<NieczynneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NieczynneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NieczynneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
