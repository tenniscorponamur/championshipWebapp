import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {ClassementAFT} from './classementAFT';
import {ClassementCorpo} from './classementCorpo';

@Injectable()
export class ClassementMembreService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getClassementsAFTByMembre(membreId:number): Observable<ClassementAFT[]> {
    return this.http.get<ClassementAFT[]>(environment.publicApiUrl + "/public/membre/" + membreId + "/classementsAFT");
  }

  getClassementsCorpoByMembre(membreId:number): Observable<ClassementCorpo[]> {
    return this.http.get<ClassementCorpo[]>(environment.publicApiUrl + "/public/membre/" + membreId + "/classementsCorpo");
  }
}
