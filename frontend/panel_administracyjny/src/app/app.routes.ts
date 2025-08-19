import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { mainGuard } from './guards/main.guard';
import { NieczynneComponent } from './nieczynne/nieczynne.component';
import { RaportsComponent } from './raports/raports.component';
import { AdministracjaOsobComponent } from './administracja-osob/administracja-osob.component';
import { CennikComponent } from './cennik/cennik.component';
import { ZstiComponent } from './users/zsti/zsti.component';

const componentImports: { [key: string]: () => Promise<any> } = {
  kalendarz: () => import('./users/kalendarz/kalendarz.component').then(m => m.KalendarzComponent),
  dane: () => import('./users/dane/dane.component').then(m => m.DaneComponent),
  deklaracje: () => import('./users/deklaracje/deklaracje.component').then(m => m.DeklaracjeComponent),
  platnosci: () => import('./users/platnosci/platnosci.component').then(m => m.PlatnosciComponent),
};

export const routes : Routes = [
  {
    path : '', component : HomeComponent,
    canActivateChild : [mainGuard],
    children : [
      {
        path : '',
        loadComponent : () => import('./nav-sidebar/home-nav/home-nav.component').then(m => m.HomeNavComponent),
        outlet : 'sidebar'
      },
      {
        path : 'osoby',
        children : [
          {
            path : '',
            loadComponent : () => import('./users/osoby/osoby.component').then(m => m.OsobyComponent),
            outlet : 'primary'
          },
          {
            path : '',
            loadComponent : () => import('./nav-sidebar/osoby-nav/osoby-nav.component').then(m => m.OsobyNavComponent),
            outlet : 'sidebar'
          },
          { path : 'zsti', component : ZstiComponent, },
          {
            path : 'internat' // TODO: Add internat component
          }
        ],
      },
      {
        path : 'osoba',
        children : [
          {
            path : 'zsti/:id',
            children : [
              { path : '', redirectTo : 'kalendarz', pathMatch : 'full' },
              ...['kalendarz', 'dane', 'deklaracje', 'platnosci'].map(childPath => ({
                path : childPath,
                loadComponent : componentImports[childPath]
              }))
            ]
          },
          {
            path : 'internat/:id', // TODO: Add internat component
            children : [
              { path : '', redirectTo : 'kalendarz', pathMatch : 'full' },
              ...['kalendarz', 'dane', 'deklaracje', 'platnosci'].map(childPath => ({
                path : childPath,
                loadComponent : componentImports[childPath]
              }))
            ]
          }
        ]
      },
      {
        path : 'cennik',
        loadComponent : () => import('./cennik/cennik.component').then(m => m.CennikComponent),
        children : [
          { path : 'zsti', component : CennikComponent },
        ]
      },
      {
        path : 'nieczynne',
        loadComponent : () => import('./nieczynne/nieczynne.component').then(m => m.NieczynneComponent),
        children : [
          { path : 'zsti', component : NieczynneComponent },
        ]
      },
      {
        path : 'raporty',
        loadComponent : () => import('./raports/raports.component').then(m => m.RaportsComponent),
        children : [
          { path : 'korekty', component : RaportsComponent },
          { path : 'obecnosci', component : RaportsComponent },
          { path : 'platnosci', component : RaportsComponent },
        ]
      },
      {
        path : 'administracja',
        loadComponent : () => import('./administracja-osob/administracja-osob.component').then(m => m.AdministracjaOsobComponent),
        children : [
          { path : 'users', component : AdministracjaOsobComponent },
          { path : 'klasy', component : AdministracjaOsobComponent },
          { path : 'dodaj-osobe', component : AdministracjaOsobComponent },
        ]
      }
    ]
  },

  { path : 'login', component : LoginComponent },
  { path : '**', redirectTo : '' }
];

@NgModule({
  imports : [RouterModule.forRoot(routes)],
  exports : [RouterModule]
})
export class AppRoutingModule {
}
