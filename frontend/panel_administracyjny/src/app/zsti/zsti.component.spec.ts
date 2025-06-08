import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZstiComponent } from './zsti.component';

describe('ZstiComponent', () => {
  let component: ZstiComponent;
  let fixture: ComponentFixture<ZstiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZstiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZstiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
