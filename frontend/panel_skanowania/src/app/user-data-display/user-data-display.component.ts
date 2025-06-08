import {Component, HostBinding, Input} from '@angular/core';
import {CardDetails} from '../data.service';
import {affirmationInfo} from '../app.component'
@Component({
  selector: 'app-user-data-display',
  imports: [],
  templateUrl: './user-data-display.component.html',
  standalone: true,
  styleUrl: './user-data-display.component.scss'
})
export class UserDataDisplayComponent {
  public rejection_color: string = '#EE964B';
  public acceptance_color: string = '#A5CC6B';
  @Input() public data!: {user: CardDetails | undefined, enterInfo: affirmationInfo};
  @HostBinding('style.background')

  get bgc(): string {
    return this.data!.enterInfo.isAbleToEnter ? this.acceptance_color : this.rejection_color;
  }

  private firstLetterCapital(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  protected formatName(user: CardDetails) {
    return `${this.firstLetterCapital(user.imie.toLowerCase())} ${this.firstLetterCapital(user.nazwisko.toLowerCase())}`;
  }
}
