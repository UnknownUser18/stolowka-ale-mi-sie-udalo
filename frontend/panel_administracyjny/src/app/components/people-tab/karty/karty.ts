import { Component, effect, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Cards, ZCard } from "@database/cards/cards";
import { Persons } from "@database/persons/persons";
import { Notifications } from "@services/notifications";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowRight, faBan, faCheck, faIdCard, faPlus, faRotateLeft, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { DialogTriggerDirective } from "@directives/dialog/dialog-trigger.directive";
import { ButtonDanger, ButtonDefault, ButtonPrimary, ButtonSuccess, Dialog, Fieldset, Input, Label } from '@ui';
import { Field, form, pattern, readonly, required } from "@angular/forms/signals";

interface CardForm {
  key_card : string;
  data_wydania : string;
  ostatnie_uzycie : string;
}

@Component({
  selector  : 'app-karty',
  imports   : [
    FaIconComponent,
    Dialog,
    DialogTriggerDirective,
    Fieldset,
    Label,
    Input,
    ButtonDefault,
    ButtonDanger,
    ButtonPrimary,
    ButtonSuccess,
    Field
  ],
  templateUrl : './karty.html',
  styleUrl  : './karty.scss',
  providers : [DatePipe]
})
export class Karty {
  protected icons = {
    faIdCard,
    faTrashCan,
    faPlus,
    faBan,
    faArrowRight,
    faRotateLeft,
    faCheck,
  }
  private card = signal<CardForm>({
    key_card        : '',
    data_wydania    : '',
    ostatnie_uzycie : '',
  });
  protected cardForm = form(this.card, (schemaPath) => {
    required(schemaPath.key_card, { message : 'Numer karty jest wymagany.' });
    pattern(schemaPath.key_card, /^[0-9]+$/, { message : 'Numer karty musi składać się wyłącznie z cyfr.' });
    readonly(schemaPath.key_card, () => true)
    required(schemaPath.data_wydania, { message : 'Data wydania jest wymagana.' });
    readonly(schemaPath.data_wydania, () => true)
    required(schemaPath.ostatnie_uzycie, { message : 'Ostatnie użycie jest wymagane.' });
    readonly(schemaPath.ostatnie_uzycie, () => true)
  });
  private addCard = signal<Omit<CardForm, 'data_wydania' | 'ostatnie_uzycie'>>({
    key_card : '',
  });
  protected addCardForm = form(this.addCard, (schemaPath) => {
    required(schemaPath.key_card, { message : 'Numer karty jest wymagany.' });
  });
  private cardData = signal<ZCard | null>(null);

  constructor(
    private cardS : Cards,
    private notificationsS : Notifications,
    private personsS : Persons,
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

      const cardForm : CardForm = {
        key_card     : String(card.key_card),
        data_wydania : this.datePipe.transform(card.data_wydania, 'yyyy-MM-dd') || '',
        ostatnie_uzycie : this.datePipe.transform(card.ostatnie_uzycie, 'yyyy-MM-dd') || '',
      };

      this.cardData.set(card);
      this.cardForm().setControlValue(cardForm);
    });
  }


  protected deleteCard() : void {
    if (!this.cardData()) {
      this.notificationsS.createErrorNotification('Brak karty do usunięcia.', 5);
      return;
    }

    this.cardS.deleteZCard(this.cardData()!.id).subscribe((result) => {
      if (!result) {
        this.notificationsS.createErrorNotification('Nie udało się usunąć karty.', 5);
        return;
      }
      this.notificationsS.createSuccessNotification('Karta została pomyślnie usunięta.');
    });
  }

  protected addCardToDB() : void {
    if (this.addCardForm().invalid()) return;

    const person = this.personsS.personZ();
    if (!person) {
      this.notificationsS.createErrorNotification('Nie znaleziono ucznia, do którego ma być przypisana karta.', 5);
      return;
    }

    const newCard : Omit<ZCard, 'id' | 'ostatnie_uzycie'> = {
      id_ucznia : person.id,
      key_card  : Number(this.addCardForm.key_card().value()),
      data_wydania : new Date(),
    };

    this.cardS.addZCard(newCard).subscribe((result) => {
      if (result === false) {
        this.notificationsS.createErrorNotification('Nie udało się dodać karty.', 5);
        return;
      }
      this.notificationsS.createSuccessNotification('Karta została pomyślnie dodana.');

      this.cardData.set({
        ...newCard,
        id : result,
        ostatnie_uzycie : new Date(),
      });

      this.cardForm().setControlValue({
        key_card        : String(this.card().key_card),
        data_wydania    : this.datePipe.transform(this.card().data_wydania, 'yyyy-MM-dd') || '',
        ostatnie_uzycie : this.datePipe.transform(this.card().ostatnie_uzycie, 'yyyy-MM-dd') || '',
      });

      this.addCardForm().reset();
    });
  }
}
