import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Classement} from './classement';
import {ClassementClub} from './classementClub';
import {EnvironmentService} from './environment.service';

@Injectable()
export class ClassementService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }

  getClassements(championnatId:number): Observable<Classement[]> {
    return this.http.get<Classement[]>(this.environmentService.getPublicApiUrl() + "/classements?championnatId="+championnatId);
  }

  getClassementsClub(championnatId:number): Observable<ClassementClub[]> {
    return this.http.get<ClassementClub[]>(this.environmentService.getPublicApiUrl() + "/classementsClub?championnatId="+championnatId);
  }
  
}
