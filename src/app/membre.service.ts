import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {EnvironmentService} from './environment.service';

import { Membre } from './membre';
import { Club } from './club';
import { MEMBRES } from './mock-members';

@Injectable()
export class MembreService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }

  getMembres(clubId:number): Observable<Membre[]> {
    return this.http.get<Membre[]>(this.environmentService.getPublicApiUrl() + "/membres" + (clubId!=null?("?clubId="+clubId):""), this.authenticationService.getPrivateApiHttpOptions());
  }

  getTemplateImportMembres(){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/membres/import/template",options);
  }

  getListeForce(){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPublicApiUrl() + "/membres/listeForce",options);
  }

  getListeForcePoints(){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPublicApiUrl() + "/membres/listeForcePoints",options);
  }

  getExportMembresByClub(club:Club){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/membres/exportByClub?clubId=" + club.id,options);
  }

  getExportMembres(){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/membres/export",options);
  }

  importData(content){
    return this.http.post<any>(this.environmentService.getPrivateApiUrl() + "/membres/import",content, this.authenticationService.getPrivateApiHttpOptions());
  }

  ajoutMembre(membre:Membre){
    return this.http.post<Membre>(this.environmentService.getPrivateApiUrl() + "/membre",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateMembreInfosGenerales(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/infosGenerales",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateClubInfos(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/clubInfos",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateCoordonnees(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/coordonnees",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateContacts(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/contacts",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateInfosAft(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/infosAft",membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  anonymisation(membre:Membre){
      return this.http.put<Membre>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/anonymisation",membre, this.authenticationService.getPrivateApiHttpOptions());
  }
  
  resetPassword(membre:Membre):Observable<boolean>{
      return this.http.post<boolean>(this.environmentService.getPrivateApiUrl() +  "/membre/" + membre.id + "/resetPassword",null, this.authenticationService.getPrivateApiHttpOptions());
  }

  setNewPassword(membre:Membre):Observable<any>{
      return this.http.post<any>(this.environmentService.getPrivateApiUrl() +  "/membre/" + membre.id + "/setNewPassword",null, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteMembre(membre: Membre) {
        return this.http.delete<Membre>(this.environmentService.getPrivateApiUrl() + "/membre?membreId=" + membre.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isMembreDeletable(membre:Membre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/membre/" + membre.id + "/deletable", this.authenticationService.getPrivateApiHttpOptions());
    }


}
