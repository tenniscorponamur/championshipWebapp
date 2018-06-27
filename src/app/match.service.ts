import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Match} from './match';
import {Set} from './set';

@Injectable()
export class MatchService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

    getMatchs(rencontreId: number): Observable<Match[]> {
        return this.http.get<Match[]>(environment.publicApiUrl + "/matchs?rencontreId=" + rencontreId);
    }

//    ajoutMatch(match: Match) {
//        return this.http.post<Match>(environment.privateApiUrl + "/match", match, this.authenticationService.getPrivateApiHttpOptions());
//    }

    updateMatch(match: Match) {
        return this.http.put<Match>(environment.privateApiUrl + "/match", match, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateMatchAndSets(match: Match, sets:Set[]):Observable<Match> {
        return this.http.put<Match>(environment.privateApiUrl + "/match/sets?matchId="+match.id, sets, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteMatch(match: Match) {
        return this.http.delete<Match>(environment.privateApiUrl + "/match?id=" + match.id, this.authenticationService.getPrivateApiHttpOptions());
    }

}
