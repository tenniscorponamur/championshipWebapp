import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Tache} from './tache';
import {EnvironmentService} from './environment.service';

@Injectable()
export class TacheService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.environmentService.getPrivateApiUrl() + "/taches", this.authenticationService.getPrivateApiHttpOptions());
  }

  getTachesOuvertes(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.environmentService.getPrivateApiUrl() + "/taches/ouvertes", this.authenticationService.getPrivateApiHttpOptions());
  }

  getTachesTraitees(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.environmentService.getPrivateApiUrl() + "/taches/traitees", this.authenticationService.getPrivateApiHttpOptions());
  }


}
