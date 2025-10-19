import { Component, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CardsService, ZCard } from "@database/cards.service";
import { PersonsService } from "@database/persons.service";
import { NotificationsService } from "@services/notifications.service";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowRight, faBan, faCheck, faIdCard, faPlus, faRotateLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { DialogComponent } from "@tooltips/dialog/dialog.component";
import { DialogTriggerDirective } from "@tooltips/dialog-trigger.directive";

@Component({
  selector : 'app-karty',
  imports : [
    ReactiveFormsModule,
    FaIconComponent,
    DialogComponent,
    DialogTriggerDirective
  ],
  templateUrl : './karty.component.html',
  styleUrl : './karty.component.scss',
  providers : [DatePipe]
})
export class KartyComponent {
  private card : ZCard | null = null;


  protected showWindow : '' | 'remove' | 'add' | 'add-continue' = '';

  protected cardForm = new FormGroup({
    key_card : new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
    data_wydania : new FormControl('', [Validators.required]),
    ostatnie_uzycie : new FormControl('', [Validators.required]),
  });

  protected addCardForm = new FormGroup({
    key_card : new FormControl('', Validators.required),
  });

  protected readonly faIdCard = faIdCard;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faPlus = faPlus;
  protected readonly faBan = faBan;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faCheck = faCheck;

  constructor(
    private cardS : CardsService,
    private notificationsS : NotificationsService,
    private personsS : PersonsService,
    private datePipe : DatePipe,
  ) {
    effect(() => {
      this.personsS.personZ();
      this.fetchCard;
    });
  }

  private get fetchCard() {
    const person = this.personsS.personZ();
    if (!person) return;

    this.cardS.getZCard(person.id).subscribe((card) => {
      if (!card) {
        this.notificationsS.createWarningNotification('Nie znaleziono karty przypisanej do tego ucznia.', 5);
        return;
      }
      this.card = card;
      this.cardForm.setValue({
        key_card : String(card.key_card),
        data_wydania : this.datePipe.transform(card.data_wydania, 'yyyy-MM-dd') || '',
        ostatnie_uzycie : this.datePipe.transform(card.ostatnie_uzycie, 'yyyy-MM-ddTHH:mm') || '',
      });

      this.cardForm.disable();
    });
  }


  protected deleteCard() : void {
    if (!this.card) {
      this.notificationsS.createErrorNotification('Brak karty do usunięcia.', 5);
      return;
    }

    this.cardS.deleteZCard(this.card.id).subscribe((result) => {
      if (!result) {
        this.notificationsS.createErrorNotification('Nie udało się usunąć karty.', 5);
        return;
      }
      this.notificationsS.createSuccessNotification('Karta została pomyślnie usunięta.');
    });
  }

  protected addCard() : void {
    if (this.addCardForm.invalid) {
      this.notificationsS.createErrorNotification('Formularz zawiera błędy.', 5);
      return;
    }

    const person = this.personsS.personZ();
    if (!person) {
      this.notificationsS.createErrorNotification('Nie znaleziono ucznia, do którego ma być przypisana karta.', 5);
      return;
    }

    const newCard : Omit<ZCard, 'id' | 'ostatnie_uzycie'> = {
      id_ucznia : person.id,
      key_card : Number(this.addCardForm.value.key_card),
      data_wydania : new Date(),
    };

    this.cardS.addZCard(newCard).subscribe((result) => {
      if (result === false) {
        this.notificationsS.createErrorNotification('Nie udało się dodać karty.', 5);
        return;
      }
      this.notificationsS.createSuccessNotification('Karta została pomyślnie dodana.');

      this.card = {
        ...newCard,
        id : result,
        ostatnie_uzycie : new Date(),
      };

      this.cardForm.patchValue({
        key_card : String(this.card.key_card),
        data_wydania : this.datePipe.transform(this.card.data_wydania, 'yyyy-MM-dd') || '',
      });

      this.cardForm.disable();
      this.addCardForm.reset();
    });
  }
}
