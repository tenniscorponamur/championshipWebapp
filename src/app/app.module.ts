import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
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


/* Component */

import { AppComponent, LoginFormDialog, CompteUtilisateurDialog } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { MembresComponent } from './membres/membres.component';
import { RencontresComponent } from './rencontres/rencontres.component';
import { HomeComponent } from './home/home.component';
import { MembreDetailComponent, HistoriqueClassementDialog, InfosGeneralesMembreDialog } from './membre-detail/membre-detail.component';

/* Services */
import { AuthenticationService } from './authentication.service';
import { ClubService } from './club.service';
import { MembreService } from './membre.service';
import { UserService } from './user.service';
import { AuthGuardService } from './auth-guard.service';
import { RequestInterceptorService } from './request-interceptor.service';
import { RencontreDetailComponent, MatchDialog } from './rencontre-detail/rencontre-detail.component';
import { ClassementDetailComponent } from './classement-detail/classement-detail.component';
import { ClassementsComponent } from './classements/classements.component';
import { ClubsComponent } from './clubs/clubs.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { UtilisateursComponent } from './utilisateurs/utilisateurs.component';
import { UtilisateurDetailComponent } from './utilisateur-detail/utilisateur-detail.component';


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
    RencontreDetailComponent,
    MatchDialog,
    ClassementDetailComponent,
    ClassementsComponent,
    ClubsComponent,
    ClubDetailComponent,
    UtilisateursComponent,
    UtilisateurDetailComponent,
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
    HttpClientModule
  ],
  entryComponents: [
      LoginFormDialog,
      CompteUtilisateurDialog,
      HistoriqueClassementDialog,
      InfosGeneralesMembreDialog,
      MatchDialog
  ],
  providers: [
    AuthenticationService,
    ClubService,
    MembreService,
    UserService,
    AuthGuardService,
    {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptorService,multi: true},
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true, disableClose:true}},
    {provide: MAT_DATE_LOCALE, useValue: 'fr-BE'},
    ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
