import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CennikComponent } from './cennik/cennik.component';
import { NieczynneComponent } from './nieczynne/nieczynne.component';
import { ZstiComponent } from './users/zsti/zsti.component';
import { KalendarzComponent } from './users/kalendarz/kalendarz.component';
import { DaneComponent } from './users/dane/dane.component';
import { DeklaracjeComponent } from './users/deklaracje/deklaracje.component';
import { PlatnosciComponent } from './users/platnosci/platnosci.component';
import { KartyComponent } from './users/karty/karty.component';
import { RaportsComponent } from './raports/raports.component';
import { LoginComponent } from './login/login.component';
import { IndividualRaportComponent } from './users/individual-raport/individual-raport.component';
import { AdministracjaOsobComponent } from './administracja-osob/administracja-osob.component';

export const routes : Routes = [
  { path : 'api', redirectTo : '', pathMatch : 'full' },
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
  { path : 'osoba/zsti/:id/karta', component : KartyComponent },
  { path : 'osoba/zsti/:id/raport', component : IndividualRaportComponent },
  { path : 'cennik', component : CennikComponent },
  { path : 'cennik/zsti', component : CennikComponent },
  { path : 'nieczynne', component : NieczynneComponent },
  { path : 'nieczynne/zsti', component : NieczynneComponent },
  { path : 'osoba/zsti/:id/karta', component : KartyComponent },
  {
    path : 'raporty', component : RaportsComponent,
    children : [
      { path : 'korekty', component : RaportsComponent },
      { path : 'obecnosci', component : RaportsComponent },
      { path : 'platnosci', component : RaportsComponent },
    ]
  },
  { path : 'login', component : LoginComponent },
  {
    path : 'administracja', component : AdministracjaOsobComponent,
    children : [
      { path : 'users', component : AdministracjaOsobComponent },
      { path : 'klasy', component : AdministracjaOsobComponent },
      { path : 'dodaj-osobe', component : AdministracjaOsobComponent },
    ]

  },
  { path : '**', redirectTo : 'login' } // Redirect to log in for any unknown routes
];

@NgModule({
  imports : [RouterModule.forRoot(routes)],
  exports : [RouterModule]
})
export class AppRoutingModule {
}
