import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Membre} from './membre';
import {Tache} from './tache';
import {EnvironmentService} from './environment.service';

@Injectable()
export class TacheService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

  tacheNouveauMembre(membre:Membre, commentairesDemande:string, numeroAft:string, codeClassementAft:string, pointsCorpo:number){
    return this.http.post<boolean>(this.environmentService.getPrivateApiUrl() + "/tache/nouveauMembre?commentairesDemande="+commentairesDemande + (numeroAft!=null?("&numeroAft="+numeroAft):"") + (codeClassementAft!=null?("&codeClassementAft="+codeClassementAft):"") + (pointsCorpo!=null?("&pointsCorpo="+pointsCorpo):""),membre, this.authenticationService.getPrivateApiHttpOptions());
  }

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.environmentService.getPrivateApiUrl() + "/taches", this.authenticationService.getPrivateApiHttpOptions());
  }

  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.environmentService.getPrivateApiUrl() + "/taches/all", this.authenticationService.getPrivateApiHttpOptions());
  }

  traitementTache(tache:Tache, numeroAft:string, pointsCorpo:number, validation:boolean, commentairesRefus:string): Observable<Tache> {
      return this.http.put<Tache>(this.environmentService.getPrivateApiUrl() + "/tache/" + tache.id + "?validation=" + validation + (numeroAft!=null?("&numeroAft="+numeroAft):"") + (pointsCorpo!=null?("&pointsCorpo="+pointsCorpo):"") + (commentairesRefus!=null?("&commentairesRefus="+commentairesRefus):""), null, this.authenticationService.getPrivateApiHttpOptions());
  }

}
