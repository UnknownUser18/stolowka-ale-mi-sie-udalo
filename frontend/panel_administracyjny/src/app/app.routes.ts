import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { mainGuard } from './guards/main.guard';
import { NieczynneComponent } from './nieczynne/nieczynne.component';
import { RaportsComponent } from './raports/raports.component';
import { AdministracjaOsobComponent } from './administracja-osob/administracja-osob.component';
import { CennikComponent } from './cennik/cennik.component';
import { LayoutComponent } from './layout/layout.component';

const componentImports : { [key : string] : () => Promise<any> } = {
  kalendarz : () => import('./users/kalendarz/kalendarz.component').then(m => m.KalendarzComponent),
  dane : () => import('./users/dane/dane.component').then(m => m.DaneComponent),
  deklaracje : () => import('./users/deklaracje/deklaracje.component').then(m => m.DeklaracjeComponent),
  karta : () => import('./users/karty/karty.component').then(m => m.KartyComponent),
  platnosci : () => import('./users/platnosci/platnosci.component').then(m => m.PlatnosciComponent),
};

export const routes : Routes = [
  {
    path : '',
    canActivateChild : [mainGuard],
    component : LayoutComponent,
    children : [
      {
        path : '',
        loadComponent : () => import('./home/home.component').then(m => m.HomeComponent),
        data : { sidebar : 'home-nav', title : 'Panel Administracyjny' },
      },
      {
        path : 'osoby',
        loadComponent : () => import('./users/osoby/osoby.component').then(m => m.OsobyComponent),
        data : { sidebar : 'osoby-nav', title : 'Osoby' },
        children : [
          {
            path : 'zsti',
            loadComponent : () => import('./users/zsti/zsti.component').then(m => m.ZstiComponent),
            data : { title : 'Osoby - ZSTI' }
          },
          {
            path : 'internat',
            loadComponent : () => import('./users/zsti/zsti.component').then(m => m.ZstiComponent) // TODO: Add internat component, defaulting to ZstiComponent for now
          }
        ]
      },
      {
        path : 'osoba',
        loadComponent : () => import('./users/osoba/osoba.component').then(m => m.OsobaComponent),
        data : { sidebar : 'osoby-nav', title : 'Osoba' },
        children : [
          {
            path : 'zsti/:id',
            children : [
              { path : '', redirectTo : 'kalendarz', pathMatch : 'full' },
              ...['kalendarz', 'dane', 'deklaracje', 'platnosci', 'karta'].map(childPath => ({
                path : childPath,
                loadComponent : componentImports[childPath],
                data : { title : `${childPath.charAt(0).toUpperCase() + childPath.slice(1)} - ZSTI` }
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
        data: {title: 'Cennik'},
        children : [
          { path : 'zsti', component : CennikComponent, data: {title : 'Cennik - ZSTI' } },
        ]
      },
      {
        path : 'nieczynne',
        loadComponent : () => import('./nieczynne/nieczynne.component').then(m => m.NieczynneComponent),
        data: {title : 'Dni Nieczynne' },
        children : [
          { path : 'zsti', component : NieczynneComponent, data: { title : 'Dni Nieczynne - ZSTI' } },
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
