import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* Component */

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { MembresComponent } from './membres/membres.component';
import { RencontresComponent } from './rencontres/rencontres.component';
import { HomeComponent } from './home/home.component';

/* Services */
import { MembreService } from './membre.service';


@NgModule({
  declarations: [
    AppComponent,
    MembresComponent,
    RencontresComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    MembreService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
