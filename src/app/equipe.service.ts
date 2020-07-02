import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Championnat} from './championnat';
import {Club} from './club';
import {Equipe} from './equipe';
import {Poule} from './poule';
import {Membre} from './membre';
import {EnvironmentService} from './environment.service';

@Injectable()
export class EquipeService {

    constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getEquipes(divisionId: number,pouleId:number): Observable<Equipe[]> {
        return this.http.get<Equipe[]>(this.environmentService.getPublicApiUrl() + "/equipes?divisionId=" + divisionId+(pouleId!=null?("&pouleId="+pouleId):""));
    }

    getEquipesByClub(championnatId: number,clubId:number): Observable<Equipe[]> {
        return this.http.get<Equipe[]>(this.environmentService.getPublicApiUrl() + "/equipesByClub?championnatId=" + championnatId + "&clubId=" + clubId);
    }

    getEquipesCriteriumByAnnee(annee: number): Observable<Equipe[]> {
        return this.http.get<Equipe[]>(this.environmentService.getPublicApiUrl() + "/equipes/criterium?annee=" + annee);
    }

    ajoutEquipe(divisionId: number, equipe: Equipe) {
        return this.http.post<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipe?divisionId=" + divisionId, equipe, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateEquipe(divisionId: number, equipe: Equipe) {
        return this.http.put<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipe?divisionId=" + divisionId, equipe, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    deleteEquipe(equipe: Equipe) {
        return this.http.delete<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipe?id=" + equipe.id, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updateEquipeNames(equipes: Equipe[]) {
        return this.http.put<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipes/names", equipes, this.authenticationService.getPrivateApiHttpOptions());
    }

    setAndUpdateEquipeNames(championnat:Championnat, club:Club){
        return this.http.put<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipes/changeNames?championnatId="+championnat.id + "&clubId="+ club.id, null, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updatePouleEquipe(equipe:Equipe,poule:Poule){
        return this.http.put<Equipe>(this.environmentService.getPrivateApiUrl() + "/equipe/poule?equipeId="+equipe.id, poule, this.authenticationService.getPrivateApiHttpOptions());
    }

    getMembresEquipe(equipe:Equipe){
        return this.http.get<Membre[]>(this.environmentService.getPrivateApiUrl() + "/equipe/" + equipe.id + "/membres", this.authenticationService.getPrivateApiHttpOptions());
    }

    addMembreEquipe(equipe:Equipe,membre:Membre){
      return this.http.post<boolean>(this.environmentService.getPrivateApiUrl() + "/equipe/" + equipe.id + "/membre/" + membre.id, null, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteMembreEquipe(equipe:Equipe,membre:Membre){
        return this.http.delete<boolean>(this.environmentService.getPrivateApiUrl() + "/equipe/" + equipe.id + "/membre/" + membre.id, this.authenticationService.getPrivateApiHttpOptions());
    }

}
