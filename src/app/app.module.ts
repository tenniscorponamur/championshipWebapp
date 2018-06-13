import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // <-- Http Client lives here
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MatInputModule,MAT_DATE_LOCALE,MatNativeDateModule } from '@angular/material'; // <-- Dialog lives here
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- dialog needs
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module
import { RxResponsiveModule } from 'rx-responsive';
import { MatTableModule } from '@angular/material/table'; // <-- Material Table
import { MatSortModule } from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Angular5TimePickerModule } from 'angular5-time-picker';


/* Component */

import { AppComponent, LoginFormDialog, CompteUtilisateurDialog } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { MembresComponent } from './membres/membres.component';
import { RencontresComponent } from './rencontres/rencontres.component';
import { HomeComponent } from './home/home.component';
import { MembreDetailComponent, HistoriqueClassementDialog, InfosGeneralesMembreDialog, ClubInfosDialog } from './membre-detail/membre-detail.component';

/* Services */
import { AuthenticationService } from './authentication.service';
import { ChampionnatService } from './championnat.service';
import { ClubService } from './club.service';
import { MembreService } from './membre.service';
import { UserService } from './user.service';
import { TerrainService } from './terrain.service';
import { AuthGuardService } from './auth-guard.service';
import { RequestInterceptorService } from './request-interceptor.service';
import { RencontreDetailComponent, MatchDialog } from './rencontre-detail/rencontre-detail.component';
import { ClassementDetailComponent } from './classement-detail/classement-detail.component';
import { ClassementsComponent } from './classements/classements.component';
import { ClubsComponent } from './clubs/clubs.component';
import { ClubDetailComponent, ClubDialog } from './club-detail/club-detail.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { UtilisateurDetailComponent, UserDialog } from './utilisateur-detail/utilisateur-detail.component';
import { ChampionnatsComponent } from './championnats/championnats.component';
import { ChampionnatEquipesComponent, SelectionClubDialog } from './championnat-equipes/championnat-equipes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChampionnatDivisionsComponent } from './championnat-divisions/championnat-divisions.component';
import { ChampionnatDivisionDetailComponent, ChampionnatDescriptionDialog } from './championnat-division-detail/championnat-division-detail.component';
import {DivisionService} from './division.service';
import {EquipeService} from './equipe.service';
import {PouleService} from './poule.service';
import { ChampionnatPoulesComponent, ChangePouleDialog } from './championnat-poules/championnat-poules.component';
import {ChampionnatDetailComponent} from './championnats/championnat-detail.component';
import { ChampionnatRencontresComponent } from './championnat-rencontres/championnat-rencontres.component';
import {RencontreService} from './rencontre.service';
import { TerrainsComponent } from './terrains/terrains.component';
import { TerrainDetailComponent, TerrainDialog } from './terrain-detail/terrain-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    MembresComponent,
    RencontresComponent,
    HomeComponent,
    MembreDetailComponent,
    LoginFormDialog,
    CompteUtilisateurDialog,
    HistoriqueClassementDialog,
    InfosGeneralesMembreDialog,
    ClubInfosDialog,
    ChampionnatDescriptionDialog,
    ChangePouleDialog,
    RencontreDetailComponent,
    MatchDialog,
    ClassementDetailComponent,
    ClassementsComponent,
    ClubsComponent,
    ClubDetailComponent,
    ClubDialog,
    UtilisateursComponent,
    UtilisateurDetailComponent,
    UserDialog,
    ChampionnatsComponent,
    ChampionnatEquipesComponent,
    SelectionClubDialog,
    DashboardComponent,
    ChampionnatDivisionsComponent,
    ChampionnatDivisionDetailComponent,
    ChampionnatPoulesComponent,
    ChampionnatRencontresComponent,
    TerrainsComponent,
    TerrainDetailComponent,
    TerrainDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatFormFieldModule,MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    ReactiveFormsModule, // <-- #2 add to @NgModule imports
    RxResponsiveModule.forRoot(),
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSliderModule,
    MatExpansionModule,
    MatSlideToggleModule,
    HttpClientModule,
    ChartsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    Angular5TimePickerModule
  ],
  entryComponents: [
      LoginFormDialog,
      CompteUtilisateurDialog,
      HistoriqueClassementDialog,
      InfosGeneralesMembreDialog,
      ClubInfosDialog,
      MatchDialog,
      ClubDialog,
      TerrainDialog,
      UserDialog,
      SelectionClubDialog,
      ChampionnatDescriptionDialog,
      ChangePouleDialog
  ],
  providers: [
    AuthenticationService,
    ChampionnatService,
    ClubService,
    DivisionService,
    EquipeService,
    PouleService,
    MembreService,
    RencontreService,
    TerrainService,
    UserService,
    AuthGuardService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorService,multi: true},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true, disableClose:true}},
    {provide: MAT_DATE_LOCALE, useValue: 'fr-BE'},
    ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
