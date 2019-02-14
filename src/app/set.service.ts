import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Set} from './set';
import {EnvironmentService} from './environment.service';

@Injectable()
export class SetService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getSets(matchId: number): Observable<Set[]> {
        return this.http.get<Set[]>(this.environmentService.getPublicApiUrl() + "/sets?matchId=" + matchId);
    }

}
