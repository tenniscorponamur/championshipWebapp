import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { HashLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // <-- Http Client lives here
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS, MatInputModule, MatNativeDateModule } from '@angular/material'; // <-- Dialog lives here
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // <-- dialog needs
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';  // <-- #1 import module
import { MatTableModule } from '@angular/material/table'; // <-- Material Table
import { MatSortModule } from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { ChartsModule } from 'ng2-charts';
import {MatTabsModule} from '@angular/material/tabs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { RecaptchaModule, RECAPTCHA_LANGUAGE } from 'ng-recaptcha';
import { ResponsiveModule } from 'ngx-responsive';


/* Component */

import { AppComponent, LoginFormDialog, AskPasswordDialog, CompteUtilisateurDialog, CookieDialog, ChangePasswordDialog } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { MembresComponent, ImportMembresDialog, DemandeDialog, NouveauMembreDialog } from './membres/membres.component';
import { RencontresComponent, InterserieDialog } from './rencontres/rencontres.component';
import { HomeComponent } from './home/home.component';
import { MembreDetailComponent, InfosAftDialog, InfosLimiteesAftDialog, InfosGeneralesMembreDialog, ClubInfosDialog, ClassementDialog, CoordonneesDialog, ContactsDialog, SimulationClassementDialog, MatchsDialog, AnonymisationDialog } from './membre-detail/membre-detail.component';

/* Services */
import { AuthenticationService } from './authentication.service';
import { AlertesService } from './alertes.service';
import { EnvironmentService } from './environment.service';
import { LocalStorageService } from './local-storage.service';
import { LocaliteService } from './localite.service';
import { ChampionnatService } from './championnat.service';
import { ClubService } from './club.service';
import { MembreService } from './membre.service';
import { UserService } from './user.service';
import { TerrainService } from './terrain.service';
import { TraceService } from './trace.service';
import { AuthGuardService } from './auth-guard.service';
import { IsSecureGuardService } from './is-secure-guard.service';
import { RequestInterceptorService } from './request-interceptor.service';
import { RencontreDetailComponent, AskPasswordToValidateDialog, CapitaineDetailDialog, InfoDialog, AllOrOnlyOneDialog, ResultatsDialog, DateTerrainDialog, CommentairesEncodeurDialog, MessagePoursuiteDialog, TracesRencontreDialog} from './rencontre-detail/rencontre-detail.component';
import { ClassementDetailComponent, RencontresDialog } from './classement-detail/classement-detail.component';
import { ClassementsComponent } from './classements/classements.component';
import { ClubsComponent } from './clubs/clubs.component';
import { ClubDetailComponent, ClubDialog, ClubTerrainDialog, InfosFacturationDialog } from './club-detail/club-detail.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { UtilisateurDetailComponent, UserDialog } from './utilisateur-detail/utilisateur-detail.component';
import { ChampionnatsComponent } from './championnats/championnats.component';
import { ChampionnatEquipesComponent, SelectionClubDialog } from './championnat-equipes/championnat-equipes.component';
import { DashboardComponent, MembreListingDialog } from './dashboard/dashboard.component';
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
import {MatchService} from './match.service';
import {ClassementCorpoJobService} from './classement-corpo-job.service';
import {SetService} from './set.service';
import {TacheService} from './tache.service';
import {ClassementService} from './classement.service';
import {ClassementMembreService} from './classement-membre.service';
import { MembreSelectionComponent } from './membre-selection/membre-selection.component';
import { DocumentsComponent } from './documents/documents.component';
import { PlanificationCriteriumComponent, JourneeCriteriumDialog, HoraireJourneeCriteriumDialog, ChoixRencontreCriteriumDialog } from './planification-criterium/planification-criterium.component';
import { HowtoComponent } from './howto/howto.component';
import { SupervisionComponent, StartDateDialog } from './supervision/supervision.component';
import { ReleaseNotesComponent } from './release-notes/release-notes.component';
import { EquipesComponent } from './equipes/equipes.component';
import { EquipeDetailComponent, SelectDivisionDialogComponent, CommentairesEquipeDialog } from './equipe-detail/equipe-detail.component';

import localeFr from '@angular/common/locales/fr';
import { CompositionEquipeDialogComponent } from './composition-equipe-dialog/composition-equipe-dialog.component';
import { SelectTerrainDialogComponent } from './select-terrain-dialog/select-terrain-dialog.component';
import { AvertissementComponent } from './avertissement/avertissement.component';
import { TaskBoardComponent } from './task-board/task-board.component';
import { DemandesComponent } from './demandes/demandes.component';
import { TacheDetailComponent,ValidationNouveauMembreDialog,RefusDialog } from './tache-detail/tache-detail.component';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    MembresComponent,
    ImportMembresDialog,
    RencontresComponent,
    InterserieDialog,
    HomeComponent,
    MembreDetailComponent,
    LoginFormDialog,
    AskPasswordDialog,
    MatchsDialog,
    CompteUtilisateurDialog,
    ChangePasswordDialog,
    CookieDialog,
    InfosAftDialog,
    InfosLimiteesAftDialog,
    SimulationClassementDialog,
    AnonymisationDialog,
    InfosGeneralesMembreDialog,
    ClubInfosDialog,
    ClassementDialog,
    CoordonneesDialog,
    ContactsDialog,
    ChampionnatDescriptionDialog,
    ChangePouleDialog,
    RencontreDetailComponent,
    AskPasswordToValidateDialog,
    CapitaineDetailDialog,
    AllOrOnlyOneDialog,
    InfoDialog,
    ResultatsDialog,
    DateTerrainDialog,
    CommentairesEncodeurDialog,
    MessagePoursuiteDialog,
    TracesRencontreDialog,
    ClassementDetailComponent,
    RencontresDialog,
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
    MembreListingDialog,
    ChampionnatDivisionsComponent,
    ChampionnatDivisionDetailComponent,
    ChampionnatPoulesComponent,
    ChampionnatRencontresComponent,
    TerrainsComponent,
    TerrainDetailComponent,
    TerrainDialog,
    ClubTerrainDialog,
    InfosFacturationDialog,
    MembreSelectionComponent,
    DocumentsComponent,
    PlanificationCriteriumComponent,
    JourneeCriteriumDialog,
    HoraireJourneeCriteriumDialog,
    ChoixRencontreCriteriumDialog,
    HowtoComponent,
    SupervisionComponent,
    StartDateDialog,
    ReleaseNotesComponent,
    EquipesComponent,
    EquipeDetailComponent,
    CommentairesEquipeDialog,
    CompositionEquipeDialogComponent,
    SelectTerrainDialogComponent,
    AvertissementComponent,
    SelectDivisionDialogComponent,
    TaskBoardComponent,
    DemandesComponent,
    DemandeDialog,
    NouveauMembreDialog,
    TacheDetailComponent,
    ValidationNouveauMembreDialog,
    RefusDialog
  ],
  imports: [
    BrowserModule,
    RecaptchaModule,
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
    ResponsiveModule.forRoot(),
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
    MatProgressSpinnerModule
  ],
  entryComponents: [
      LoginFormDialog,
      AskPasswordDialog,
      CompteUtilisateurDialog,
      ChangePasswordDialog,
      CookieDialog,
      InfosAftDialog,
      InfosLimiteesAftDialog,
      SimulationClassementDialog,
      AnonymisationDialog,
      MatchsDialog,
      InfosGeneralesMembreDialog,
      CoordonneesDialog,
      ContactsDialog,
      ClubInfosDialog,
      ClassementDialog,
      ClubDialog,
      TerrainDialog,
      ClubTerrainDialog,
      InfosFacturationDialog,
      UserDialog,
      SelectionClubDialog,
      MembreListingDialog,
      ChampionnatDescriptionDialog,
      ChangePouleDialog,
      CompositionEquipeDialogComponent,
      SelectTerrainDialogComponent,
      MembreSelectionComponent,
      ResultatsDialog,
      DateTerrainDialog,
      CommentairesEncodeurDialog,
      MessagePoursuiteDialog,
      TracesRencontreDialog,
      AskPasswordToValidateDialog,
      CapitaineDetailDialog,
      AllOrOnlyOneDialog,
      InfoDialog,
      InterserieDialog,
      RencontresDialog,
      ImportMembresDialog,
      JourneeCriteriumDialog,
      HoraireJourneeCriteriumDialog,
      ChoixRencontreCriteriumDialog,
      AvertissementComponent,
      SelectDivisionDialogComponent,
      CommentairesEquipeDialog,
      StartDateDialog,
      DemandeDialog,
      NouveauMembreDialog,
      ValidationNouveauMembreDialog,
      RefusDialog
  ],
  providers: [
    AuthenticationService,
    AlertesService,
    EnvironmentService,
    ChampionnatService,
    ClubService,
    DivisionService,
    EquipeService,
    PouleService,
    MembreService,
    RencontreService,
    MatchService,
    SetService,
    ClassementService,
    ClassementMembreService,
    ClassementCorpoJobService,
    TerrainService,
    TraceService,
    TacheService,
    UserService,
    AuthGuardService,
    IsSecureGuardService,
    LocaliteService,
    LocalStorageService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorService,multi: true},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true, disableClose:false}},
    {provide: MAT_DATE_LOCALE, useValue: 'fr-BE'},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: RECAPTCHA_LANGUAGE,useValue: 'fr'},
    ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
