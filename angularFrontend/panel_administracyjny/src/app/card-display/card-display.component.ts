import {Component, OnInit, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
// @ts-ignore
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-card',
  templateUrl: './card-display.component.html',
  standalone: true,
  styleUrls: ['./card-display.component.css']
})
export class CardDisplayComponent implements OnInit, OnChanges{
  @Input() cardKey: string = '1234-5678-9101';  // Example card number
  @Input() ownerName: string = 'John Doe';  // Example owner's name


  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.generateQRCode(this.cardKey);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cardKey'] || changes['ownerName']) {
      this.generateQRCode(this.cardKey);
    }
  }

  generateQRCode(data: string): void {
    const canvas = this.elRef.nativeElement.querySelector('#qrCodeCanvas');
    QRCode.toCanvas(canvas, data, { width: 50, margin: 2 }, function (error: any) {
      if (error) {
        console.error(error);
      }
    });
  }
}
