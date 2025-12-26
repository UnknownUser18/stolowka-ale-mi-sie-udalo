import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { ZPerson } from "@database/persons/persons";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn : 'root',
})
export class LastPersons {
  public readonly ZPersonsIDs = signal<ZPerson['id'][]>(this.getLastZPersons() ?? []);
  private platformID = inject(PLATFORM_ID);

  constructor() {}

  public get getLastZPersonsList() : ZPerson['id'][] {
    return this.getLastZPersons() ?? [];
  }

  public pushZPerson(personId : ZPerson['id']) : void {
    if (!isPlatformBrowser(this.platformID)) return;

    let lastPersons = this.getLastZPersons() ?? [];

    lastPersons = [personId, ...lastPersons.filter(existingId => existingId !== personId)];

    if (lastPersons.length > 10) {
      lastPersons = lastPersons.slice(0, 10);
    }

    localStorage.setItem('lastPersonsZ', JSON.stringify(lastPersons));
    this.ZPersonsIDs.set(lastPersons);
  }

  private getLastZPersons() : ZPerson['id'][] | null {
    if (!isPlatformBrowser(this.platformID)) return null;

    const lastPersons = localStorage.getItem('lastPersonsZ');
    if (!lastPersons) return null;

    return JSON.parse(lastPersons) as ZPerson['id'][];
  }
}
