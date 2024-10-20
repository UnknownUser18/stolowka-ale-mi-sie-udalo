import { Component } from '@angular/core';
import { PanelComponent } from './panel/panel.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [PanelComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  osoba : string | undefined;
  title: string = 'panel_administracyjny';
  show(event: Event) {
    let target = event.target as HTMLElement;
    if(target.tagName !== 'BUTTON') return;
    else {
      target = target.parentElement as HTMLElement;
      this.osoba = target.querySelector('span')?.textContent!;
      console.log(this.osoba);
    }
  }
}
