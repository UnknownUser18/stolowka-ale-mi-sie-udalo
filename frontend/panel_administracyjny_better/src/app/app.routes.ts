import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OsobyComponent } from './osoby/osoby.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'osoby', component: OsobyComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
