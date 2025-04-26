import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ZstiComponent } from './zsti/zsti.component';
import { KalendarzComponent } from './kalendarz/kalendarz.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'osoby', component: HomeComponent },
  { path: 'osoby/zsti', component: ZstiComponent },
  { path: 'osoba/zsti/:id/kalendarz', component: KalendarzComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
