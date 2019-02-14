import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Localite} from './localite';
import {EnvironmentService} from './environment.service';

@Injectable()
export class LocaliteService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService){
   }

  getLocalites(): Observable<Localite[]> {
    return this.http.get<Localite[]>(this.environmentService.getPublicApiUrl() + "/localites");
  }

  getRuesByCodePostal(codePostal:string): Observable<string[]> {
    return this.http.get<string[]>(this.environmentService.getPublicApiUrl() + "/localite/" + codePostal + "/rues");
  }

}
