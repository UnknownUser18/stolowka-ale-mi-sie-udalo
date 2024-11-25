import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KartyComponent } from './karty.component';

describe('KartyComponent', () => {
  let component: KartyComponent;
  let fixture: ComponentFixture<KartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KartyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
