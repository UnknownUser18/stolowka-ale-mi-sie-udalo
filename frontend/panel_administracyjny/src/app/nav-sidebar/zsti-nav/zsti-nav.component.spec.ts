import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZstiNavComponent } from './zsti-nav.component';

describe('ZstiNavComponent', () => {
  let component: ZstiNavComponent;
  let fixture: ComponentFixture<ZstiNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZstiNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZstiNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
