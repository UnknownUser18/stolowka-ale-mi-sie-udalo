import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from '@components/login/login';
import { mainGuard } from './guards/main.guard';
import { Nieczynne } from '@components/nieczynne/nieczynne';
import { Raports } from '@components/raports/raports';
import { AdministracjaOsob } from '@components/administracja-osob/administracja-osob';
import { Cennik } from '@components/cennik/cennik';
import { Layout } from './layout/layout';

const componentImports : { [key : string] : () => Promise<any> } = {
  kalendarz  : () => import('@components/people-tab/kalendarz/kalendarz').then(m => m.Kalendarz),
  dane       : () => import('@components/people-tab/dane/dane').then(m => m.Dane),
  deklaracje : () => import('@components/people-tab/deklaracje/deklaracje').then(m => m.Deklaracje),
  karta      : () => import('@components/people-tab/karty/karty').then(m => m.Karty),
  platnosci  : () => import('@components/people-tab/platnosci/platnosci').then(m => m.Platnosci),
};

export const routes : Routes = [
  {
    path : '',
    canActivateChild : [mainGuard],
    component : Layout,
    children : [
      {
        path : '',
        loadComponent : () => import('@components/home/home').then(m => m.Home),
        data : { sidebar : 'home-nav', title : 'Panel Administracyjny' },
      },
      {
        path : 'osoby',
        loadComponent : () => import('@components/people-tab/osoby/osoby').then(m => m.Osoby),
        data : { sidebar : 'osoby-nav', title : 'Osoby' },
        children : [
          {
            path : 'zsti',
            loadComponent : () => import('@components/people-tab/zsti/zsti').then(m => m.Zsti),
            data : { title : 'Osoby - ZSTI' }
          },
          {
            path : 'internat',
            loadComponent : () => import('@components/people-tab/zsti/zsti').then(m => m.Zsti) // TODO: Add internat component, defaulting to Zsti for now
          }
        ]
      },
      {
        path : 'osoba',
        loadComponent : () => import('@components/people-tab/osoba/osoba').then(m => m.Osoba),
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
        loadComponent : () => import('@components/cennik/cennik').then(m => m.Cennik),
        data: {title: 'Cennik'},
        children : [
          { path : 'zsti', component : Cennik, data : { title : 'Cennik - ZSTI' } },
        ]
      },
      {
        path : 'nieczynne',
        loadComponent : () => import('@components/nieczynne/nieczynne').then(m => m.Nieczynne),
        data: {title : 'Dni Nieczynne' },
        children : [
          { path : 'zsti', component : Nieczynne, data : { title : 'Dni Nieczynne - ZSTI' } },
        ]
      },
      {
        path : 'raporty',
        loadComponent : () => import('@components/raports/raports').then(m => m.Raports),
        children : [
          { path : 'korekty', component : Raports },
          { path : 'obecnosci', component : Raports },
          { path : 'platnosci', component : Raports },
        ]
      },
      {
        path : 'administracja',
        loadComponent : () => import('@components/administracja-osob/administracja-osob').then(m => m.AdministracjaOsob),
        children : [
          { path : 'users', component : AdministracjaOsob },
          { path : 'klasy', component : AdministracjaOsob },
          { path : 'dodaj-osobe', component : AdministracjaOsob },
        ]
      }
    ]
  },

  { path : 'login', component : Login },
  { path : '**', redirectTo : '' }
];

@NgModule({
  imports : [RouterModule.forRoot(routes)],
  exports : [RouterModule]
})
export class AppRoutingModule {
}
