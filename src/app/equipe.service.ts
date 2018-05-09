import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Equipe} from './equipe';
import {Poule} from './poule';

@Injectable()
export class EquipeService {

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

    getEquipes(divisionId: number,pouleId:number): Observable<Equipe[]> {
        return this.http.get<Equipe[]>(environment.publicApiUrl + "/equipes?divisionId=" + divisionId+(pouleId!=null?("&pouleId="+pouleId):""));
    }

    ajoutEquipe(divisionId: number, equipe: Equipe) {
        return this.http.post<Equipe>(environment.privateApiUrl + "/equipe?divisionId=" + divisionId, equipe, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateEquipe(divisionId: number, equipe: Equipe) {
        return this.http.put<Equipe>(environment.privateApiUrl + "/equipe?divisionId=" + divisionId, equipe, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    deleteEquipe(equipe: Equipe) {
        return this.http.delete<Equipe>(environment.privateApiUrl + "/equipe?id=" + equipe.id, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updateEquipeNames(equipes: Equipe[]) {
        return this.http.put<Equipe>(environment.privateApiUrl + "/equipes/names", equipes, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updatePouleEquipe(equipe:Equipe,poule:Poule){
        return this.http.put<Equipe>(environment.privateApiUrl + "/equipe/poule?equipeId="+equipe.id, poule, this.authenticationService.getPrivateApiHttpOptions());
    }

}
