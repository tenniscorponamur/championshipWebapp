import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { HttpClientModule } from '@angular/common/http'; // <-- Http Client lives here

/* Component */

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { MembresComponent } from './membres/membres.component';
import { RencontresComponent } from './rencontres/rencontres.component';
import { HomeComponent } from './home/home.component';
import { MembreDetailComponent } from './membre-detail/membre-detail.component';

/* Services */
import { MembreService } from './membre.service';


@NgModule({
  declarations: [
    AppComponent,
    MembresComponent,
    RencontresComponent,
    HomeComponent,
    MembreDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    MembreService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
