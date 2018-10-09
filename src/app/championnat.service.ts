import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {Championnat} from './championnat';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class ChampionnatService {

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

    getChampionnats(): Observable<Championnat[]> {
        return this.http.get<Championnat[]>(environment.publicApiUrl + "/championnats");
    }

    ajoutChampionnat(championnat: Championnat) {
        return this.http.post<Championnat>(environment.privateApiUrl + "/championnat", championnat, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateChampionnat(championnat: Championnat) {
        return this.http.put<Championnat>(environment.privateApiUrl + "/championnat", championnat, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteChampionnat(championnat: Championnat) {
        return this.http.delete<Championnat>(environment.privateApiUrl + "/championnat?id=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateCalendrierARafraichirChampionnat(championnat:Championnat, calendrierARafraichir:boolean){
        return this.http.put<boolean>(environment.privateApiUrl + "/championnat/calendrierARafraichir?championnatId=" + championnat.id, calendrierARafraichir, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeChampionnat(championnat:Championnat, calendrierValidite:boolean){
        return this.http.put<boolean>(environment.privateApiUrl + "/championnat/calendrierValide?championnatId=" + championnat.id, calendrierValidite, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateClotureChampionnat(championnat:Championnat, cloture:boolean){
        return this.http.put<boolean>(environment.privateApiUrl + "/championnat/cloture?championnatId=" + championnat.id, cloture, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierARafraichir(championnat:Championnat) {
        return this.http.get<boolean>(environment.privateApiUrl + "/championnat/isCalendrierARafraichir?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierValidable(championnat:Championnat) {
        return this.http.get<boolean>(environment.privateApiUrl + "/championnat/isCalendrierValidable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierInvalidable(championnat:Championnat) {
        return this.http.get<boolean>(environment.privateApiUrl + "/championnat/isCalendrierInvalidable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCalendrierDeletable(championnat:Championnat) {
        return this.http.get<boolean>(environment.privateApiUrl + "/championnat/isCalendrierDeletable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isCloturable(championnat:Championnat) {
        return this.http.get<boolean>(environment.privateApiUrl + "/championnat/isCloturable?championnatId=" + championnat.id, this.authenticationService.getPrivateApiHttpOptions());
    }

  getListeCapitaines(championnat:Championnat){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(environment.privateApiUrl + "/championnat/listeCapitaines?championnatId=" + championnat.id,options);
  }

}
