import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService }                from './auth-guard.service';
import { IsSecureGuardService }                from './is-secure-guard.service';
import { ClassementsComponent }      from './classements/classements.component';
import { HomeComponent }      from './home/home.component';
import { MembresComponent }      from './membres/membres.component';
import { RencontresComponent }      from './rencontres/rencontres.component';
import {ClubsComponent} from './clubs/clubs.component';
import {UtilisateursComponent} from './utilisateurs/utilisateurs.component';
import { TerrainsComponent } from './terrains/terrains.component';
import {ChampionnatsComponent} from './championnats/championnats.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'classements', component: ClassementsComponent, canActivate: [IsSecureGuardService] },
  { path: 'home', component: HomeComponent, canActivate: [IsSecureGuardService] },
  { path: 'clubs', component: ClubsComponent, canActivate: [IsSecureGuardService,AuthGuardService] },
  { path: 'championnats', component: ChampionnatsComponent, canActivate: [IsSecureGuardService,AuthGuardService] },
  { path: 'membres', component: MembresComponent, canActivate: [IsSecureGuardService] },
  { path: 'rencontres', component: RencontresComponent, canActivate: [IsSecureGuardService] },
  { path: 'terrains', component: TerrainsComponent, canActivate: [IsSecureGuardService,AuthGuardService] },
  { path: 'utilisateurs', component: UtilisateursComponent, canActivate: [IsSecureGuardService,AuthGuardService] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [IsSecureGuardService,AuthGuardService] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
