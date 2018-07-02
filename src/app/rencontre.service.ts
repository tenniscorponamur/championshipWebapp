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

    isValidable(rencontre:Rencontre) {
        return this.http.get<boolean>(environment.publicApiUrl + "/rencontre/isValidable?rencontreId=" + rencontre.id);
    }

    updateRencontre(rencontre: Rencontre) {
        return this.http.put<Rencontre>(environment.privateApiUrl + "/rencontre", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeRencontre(rencontre:Rencontre, validite:boolean){
        return this.http.put<boolean>(environment.privateApiUrl + "/rencontre/validite?rencontreId=" + rencontre.id, validite, this.authenticationService.getPrivateApiHttpOptions());
    }

    creerCalendrier(championnatId: number){
        return this.http.post<Rencontre[]>(environment.privateApiUrl + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    supprimerCalendrier(championnatId: number){
        return this.http.delete<Rencontre[]>(environment.privateApiUrl + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }


}
