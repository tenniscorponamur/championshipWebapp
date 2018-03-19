import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ClassementsComponent }      from './classements/classements.component';
import { HomeComponent }      from './home/home.component';
import { MembresComponent }      from './membres/membres.component';
import { RencontresComponent }      from './rencontres/rencontres.component';

const routes: Routes = [
  { path: 'classements', component: ClassementsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'membres', component: MembresComponent },
  { path: 'rencontres', component: RencontresComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
