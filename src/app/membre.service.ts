import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {AuthenticationService} from './authentication.service';

import { Membre } from './membre';
import { MEMBRES } from './mock-members';

@Injectable()
export class MembreService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getMembres(clubId:number): Observable<Membre[]> {
    return this.http.get<Membre[]>(environment.publicApiUrl + "/membres" + (clubId!=null?("?clubId="+clubId):""));
  }

  getRapportMembres() {
    return this.http.get("http://localhost:9100/api/testRapport",{responseType: 'blob'});
  }

  ajoutMembre(membre:Membre){
    return this.http.post<Membre>(environment.privateApiUrl + "/membre",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateMembreInfosGenerales(membre:Membre){
      return this.http.put<Membre>(environment.privateApiUrl + "/membre/" + membre.id + "/infosGenerales",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateClubInfos(membre:Membre){
      return this.http.put<Membre>(environment.privateApiUrl + "/membre/" + membre.id + "/clubInfos",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateInfosAft(membre:Membre){
      return this.http.put<Membre>(environment.privateApiUrl + "/membre/" + membre.id + "/infosAft",membre, this.authenticationService.getPrivateApiHttpOptions());
  }


}
