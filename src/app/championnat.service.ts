import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {Championnat} from './championnat';
import {AuthenticationService} from './authentication.service';
import {EnvironmentService} from './environment.service';
import {formatDateInString} from './utility';

@Injectable()
export class ChampionnatService {

    constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getChampionnats(): Observable<Championnat[]> {
        return this.http.get<Championnat[]>(this.environmentService.getPublicApiUrl() + "/championnats");
    }

    ajoutChampionnat(championnat: Championnat) {
        return this.http.post<Championnat>(this.environmentService.getPrivateApiUrl() + "/championnat", championnat, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateChampionnat(championnat: Championnat) {
        return this.http.put<Championnat>(this.environmentService.getPrivateApiUrl() + "/championnat", championnat, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteChampionnat(championnat: Championnat) {
        return this.http.delete<Championnat>(this.environmentService.getPrivateApiUrl() + "/championnat?id=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateCalendrierARafraichirChampionnat(championnat:Championnat, calendrierARafraichir:boolean){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/calendrierARafraichir?championnatId=" + championnat.id, calendrierARafraichir, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeChampionnat(championnat:Championnat, calendrierValidite:boolean){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/calendrierValide?championnatId=" + championnat.id, calendrierValidite, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateClotureChampionnat(championnat:Championnat, cloture:boolean){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/cloture?championnatId=" + championnat.id, cloture, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCriteriumEditable(annee:string) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCriteriumEditable?annee=" + annee, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierARafraichir(championnat:Championnat) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCalendrierARafraichir?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierValidable(championnat:Championnat) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCalendrierValidable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierInvalidable(championnat:Championnat) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCalendrierInvalidable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierDeletable(championnat:Championnat) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCalendrierDeletable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCloturable(championnat:Championnat) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/championnat/isCloturable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

  getListeCapitaines(championnat:Championnat){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/championnat/listeCapitaines?championnatId=" + championnat.id,options);
  }

  getTableauCriterium(date:Date){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/championnat/tableauCriterium?date=" + formatDateInString(date),options);
  }

}
