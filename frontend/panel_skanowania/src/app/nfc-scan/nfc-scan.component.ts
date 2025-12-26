import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {map, Observable, startWith} from 'rxjs';
import {CardDetails} from '../data.service';
import {DbService} from '../db.service';

@Component({
  selector: 'app-nfc-scan',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatAutocomplete,
    MatOption,
    AsyncPipe,
    MatAutocompleteTrigger,
    MatInput,
    MatLabel
  ],
  templateUrl: './nfc-scan.component.html',
  standalone: true,
  styleUrl: './nfc-scan.component.scss'
})
export class NfcScanComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('nfc_input') nfc_input: ElementRef | undefined;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  @Output() nfcOutput: EventEmitter<string> = new EventEmitter();
  control = new FormControl('');

  options: CardDetails[] = [];
  filteredOptions: Observable<CardDetails[]> = new Observable<CardDetails[]>();

  focusInterval: ReturnType<typeof setInterval> | null = null;

  ngAfterViewInit() {
    console.log(this.nfc_input?.nativeElement);
    this.focusInterval = setInterval(() => this.focusInput(), 1000)
    this.focusInput()
  }

  ngOnDestroy() {
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
    }
  }
  ngOnInit() {
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.control.valueChanges
      .subscribe(value => this.handleInput(value));
  }

  private handleInput(value: string | null) {
    const hasLetter = /[a-zA-Z]/.test(value || '');

    if (!value || (!hasLetter && this.autocompleteTrigger.panelOpen)) {
      this.autocompleteTrigger.closePanel();
    }
  }

  constructor(private database: DbService) {
    effect(() => {
      this.database.ZCardsWDetails()
      this.updateOptions().then()
    });
  }

  private async updateOptions() {
    this.options = this.database.ZCardsWDetails() ?? []
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private formatOption(option: CardDetails): string {
    return `${option.imie} ${option.nazwisko} ${option.id} ${option.key_card}`;
  }

  private _filter(value: string): CardDetails[] {
    const filterValue = value.toString().toLowerCase();

    if (filterValue.length > 0 && /^\d/.test(filterValue)) {
      return [];
    }

    return this.options.filter(option => {
      const optionText = this.formatOption(option).toLowerCase();

      const nameMatch = `${option.imie} ${option.nazwisko}`.toLowerCase().includes(filterValue);
      const fullMatch = optionText.includes(filterValue);

      return nameMatch || fullMatch;
    });
  }

  submitInput(event: Event){
    event.preventDefault();
    const input: HTMLInputElement = (this.nfc_input?.nativeElement as HTMLInputElement)
    this.nfcOutput.emit(input.value)
    input.value = '';
    this.autocompleteTrigger.closePanel();
  }

  focusInput(): void {
     if(!this.nfc_input) return;
    setTimeout(()=>{
      this.nfc_input?.nativeElement.focus();
    }, 500)
  }
}
