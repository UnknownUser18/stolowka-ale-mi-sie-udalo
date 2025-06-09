import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ZstiComponent } from './users/zsti/zsti.component';
import { KalendarzComponent } from './users/kalendarz/kalendarz.component';
import { DaneComponent } from './users/dane/dane.component';
import { DeklaracjeComponent } from './users/deklaracje/deklaracje.component';
import { PlatnosciComponent } from './users/platnosci/platnosci.component';
import { KartyComponent } from './users/karty/karty.component';

export const routes : Routes = [
  { path : '', component : HomeComponent },
  {
    path : 'osoby',
    component : ZstiComponent,
    children : [
      { path : 'zsti', component : ZstiComponent },
    ],
  },
  { path : 'osoby/zsti', component : ZstiComponent },
  { path : 'osoba/zsti/:id/kalendarz', component : KalendarzComponent },
  { path : 'osoba/zsti/:id/dane', component : DaneComponent },
  { path : 'osoba/zsti/:id/deklaracje', component : DeklaracjeComponent },
  { path : 'osoba/zsti/:id/platnosci', component : PlatnosciComponent },
  { path : 'osoba/zsti/:id/karta', component : KartyComponent }
];

@NgModule({
  imports : [RouterModule.forRoot(routes)],
  exports : [RouterModule]
})
export class AppRoutingModule {
}
