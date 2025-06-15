import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Card, DataService } from '../../services/data.service';
import { TransitionService } from '../../services/transition.service';
import { GlobalInfoService, NotificationType } from '../../services/global-info.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { VariablesService } from '../../services/variables.service';

@Component({
  selector : 'app-karty',
  imports : [
    ReactiveFormsModule
  ],
  templateUrl : './karty.component.html',
  styleUrl : './karty.component.scss',
  providers: [DatePipe]
})
export class KartyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  protected card : Card | null = null;
  protected showWindow : '' | 'remove' | 'add' | 'add-continue' = '';

  protected cardForm = new FormGroup({
    key_card : new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    data_wydania : new FormControl('', [Validators.required]),
    ostatnie_uzycie : new FormControl('', [Validators.required]),
  });

  protected addCardForm = new FormGroup({
    key_card: new FormControl('', Validators.required),
  });


  @ViewChild('window') window! : ElementRef;

  constructor(
    private variables : VariablesService,
    private datePipe : DatePipe,
    private database : DataService,
    private transition : TransitionService,
    private infoService : GlobalInfoService,
    private cdr : ChangeDetectorRef,
    private zone : NgZone
  ) {
    this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {

      this.infoService.activeUser.pipe(takeUntil(this.destroy$)).subscribe(user => {
        if (!user) return;

        this.infoService.setTitle(`${ user.imie } ${ user.nazwisko } - Karty`);
        this.infoService.setActiveTab('KARTA');

        this.database.request('zsti.card.getById', { id_ucznia : user.id }, 'cardList').then((payload) => {
          if (!payload) {
            this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać karty.');
            return;
          } else if (payload.length === 0) {
            this.infoService.generateNotification(NotificationType.WARNING, 'Osoba nie posiada przypisanej do niej karty.');
          }
          this.card = payload[0];
          this.cardForm.patchValue({
            key_card : this.card?.key_card !== undefined ? this.card.key_card.toString() : '',
            data_wydania : this.card?.data_wydania !== undefined ? this.datePipe.transform(this.card.data_wydania, 'yyyy-MM-dd') : '',
            ostatnie_uzycie : this.card?.ostatnie_uzycie !== null ? this.datePipe.transform(this.card?.ostatnie_uzycie!, 'yyyy-MM-ddTHH:mm') : '',
          });
        });
      });
    });
  }

  protected openWindow(type : '' | 'remove' | 'add' | 'add-continue') : void {
    this.showWindow = type;
    this.cdr.detectChanges();
    this.transition.applyAnimation(this.window.nativeElement, true, this.zone).then();
  }

  protected closeWindow() : void {
    this.transition.applyAnimation(this.window.nativeElement, false, this.zone).then(() : void => {
      this.showWindow = '';
    });
  }

  protected removeCard(close : boolean) : void {
    if (!this.card && close) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Nie można usunąć karty, ponieważ nie jest ona przypisana do żadnej osoby.');
      return;
    }
    if (this.card) {
      this.database.request('zsti.card.update', { id: this.card?.id, key_card: '0' }, 'cardList').then((payload) => {
        if (!payload) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się usunąć karty.');
          return;
        }
        this.infoService.generateNotification(NotificationType.SUCCESS, 'Karta została pomyślnie usunięta.');
        this.card = null;
        this.cardForm.reset();
      });
    }
    if (close) this.closeWindow();
    else this.openWindow('add-continue');
  }

  protected addCard() : void {
    if (this.addCardForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    const keyCard = this.addCardForm.value.key_card!.toString();
    const date = new Date();
    const dataWydania = `${ date.getFullYear() }-${ (date.getMonth() + 1).toString().padStart(2, '0') }-${ date.getDate().toString().padStart(2, '0') }`;
    this.database.request('zsti.card.updateWithData', { id_ucznia: this.infoService.activeUser.value?.id, key_card: keyCard, data_wydania: dataWydania }, 'cardList').then((payload) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się dodać karty.');
        return;
      }
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Karta została pomyślnie dodana.');
      this.closeWindow();

      this.database.request('zsti.card.getById', { id_ucznia: this.infoService.activeUser.value?.id }, 'cardList').then((payload) => {
        if (!payload || payload.length === 0) {
          this.infoService.generateNotification(NotificationType.ERROR, 'Nie udało się pobrać karty po dodaniu.');
          return;
        }
        this.card = payload[0];
        this.cardForm.patchValue({
          key_card : this.card?.key_card.toString(),
          data_wydania : this.datePipe.transform(this.card?.data_wydania!, 'yyyy-MM-dd'),
          ostatnie_uzycie : this.datePipe.transform(this.card?.ostatnie_uzycie, 'yyyy-MM-ddTHH:mm'),
        });
      });
    });
  }
  public ngOnDestroy() : void {
    this.card = null;
    this.destroy$.next();
    this.destroy$.complete();
  }
}
