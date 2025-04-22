import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ZstiComponent } from './zsti/zsti.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'osoby', component: HomeComponent },
  { path: 'osoby/zsti', component: ZstiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
