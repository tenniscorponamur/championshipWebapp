import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Rencontre} from './rencontre';

@Injectable()
export class RencontreService {

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

    getRencontres(divisionId: number,pouleId:number,equipeId:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(environment.publicApiUrl + "/rencontres?divisionId=" + divisionId+(pouleId!=null?("&pouleId="+pouleId):"")+(equipeId!=null?("&equipeId="+equipeId):""));
    }
    
    getLastResults(maxNumberOfResults:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(environment.publicApiUrl + "/rencontres/last?numberOfResults=" + maxNumberOfResults);
    }
    
    getNextMeetings(maxNumberOfResults:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(environment.publicApiUrl + "/rencontres/next?numberOfResults=" + maxNumberOfResults);
    }

    isValidable(rencontre:Rencontre) {
        return this.http.get<boolean>(environment.publicApiUrl + "/rencontre/" + rencontre.id + "/isValidable");
    }

    createRencontre(rencontre: Rencontre) {
        return this.http.post<Rencontre>(environment.privateApiUrl + "/rencontre", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updateRencontre(rencontre: Rencontre) {
        return this.http.put<Rencontre>(environment.privateApiUrl + "/rencontre", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeRencontre(rencontre:Rencontre, validite:boolean){
        return this.http.put<boolean>(environment.privateApiUrl + "/rencontre/" + rencontre.id + "/validite", validite, this.authenticationService.getPrivateApiHttpOptions());
    }

    creerCalendrier(championnatId: number){
        return this.http.post<Rencontre[]>(environment.privateApiUrl + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    refreshCalendrier(championnatId: number){
        return this.http.put<Rencontre[]>(environment.privateApiUrl + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    supprimerCalendrier(championnatId: number){
        return this.http.delete<Rencontre[]>(environment.privateApiUrl + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    getInterseries(championnatId: number) {
      return this.http.get<Rencontre[]>(environment.privateApiUrl + "/rencontres/interseries?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

}
