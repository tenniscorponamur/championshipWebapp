    import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService }                from './auth-guard.service';
import { ClassementsComponent }      from './classements/classements.component';
import { HomeComponent }      from './home/home.component';
import { MembresComponent }      from './membres/membres.component';
import { RencontresComponent }      from './rencontres/rencontres.component';
import {ClubsComponent} from './clubs/clubs.component';
import {UtilisateursComponent} from './utilisateurs/utilisateurs.component';

const routes: Routes = [
  { path: 'classements', component: ClassementsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'clubs', component: ClubsComponent, canActivate: [AuthGuardService] },
  { path: 'membres', component: MembresComponent },
  { path: 'rencontres', component: RencontresComponent },
  { path: 'utilisateurs', component: UtilisateursComponent, canActivate: [AuthGuardService] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
