import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NfcScanComponent } from './nfc-scan.component';

describe('NfcScanComponent', () => {
  let component: NfcScanComponent;
  let fixture: ComponentFixture<NfcScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NfcScanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NfcScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
