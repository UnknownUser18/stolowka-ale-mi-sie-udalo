import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {debounceTime, map, Observable, startWith} from 'rxjs';
import {CardDetails, DataService} from '../data.service';

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
export class NfcScanComponent implements AfterViewInit, OnInit {
  @ViewChild('nfc_input') nfc_input: ElementRef | undefined;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  @Output() nfcOutput: EventEmitter<string> = new EventEmitter();
  control = new FormControl('');

  options: CardDetails[] = [];
  filteredOptions: Observable<CardDetails[]> = new Observable<CardDetails[]>();

  ngAfterViewInit() {
    console.log(this.nfc_input?.nativeElement);
    this.focusInput()
  }

  ngOnInit() {
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.control.valueChanges
      .pipe(debounceTime(30))
      .subscribe(value => this.handleInput(value));
  }

  private handleInput(value: string | null) {
    const hasLetter = /[a-zA-Z]/.test(value || '');

    if (!value || (!hasLetter && this.autocompleteTrigger.panelOpen)) {
      this.autocompleteTrigger.closePanel();
    }
  }

  constructor(private dataService: DataService) {
    this.dataService.dataChange.subscribe(key => {
      if(key === 'cardDetailsList')
        this.updateOptions()
    })
  }

  private updateOptions() {
    this.options = [];
    this.dataService.get('cardDetailsList')?.forEach(value => {
      this.options.push(value)
    })
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private formatOption(option: CardDetails): string {
    return `${option.imie} ${option.nazwisko} ${option.id} ${option.key_card}`;
  }

  private _filter(value: string): CardDetails[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => this.formatOption(option).toLowerCase().includes(filterValue));
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
