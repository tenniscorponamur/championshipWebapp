import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Match} from './match';
import {Set} from './set';
import {formatDateInString} from './utility';
import {EnvironmentService} from './environment.service';

@Injectable()
export class MatchService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getMatchs(rencontreId: number): Observable<Match[]> {
        return this.http.get<Match[]>(this.environmentService.getPublicApiUrl() + "/rencontre/" + rencontreId + "/matchs");
    }

    getMatchsValidesByCriteria(membreId: number,startDate:Date, endDate:Date): Observable<Match[]> {
        return this.http.get<Match[]>(this.environmentService.getPublicApiUrl() + "/matchs/validesByCriteria?membreId=" + membreId + "&startDate=" + formatDateInString(startDate) + "&endDate=" + formatDateInString(endDate));
    }

    updateMatch(match: Match) {
        return this.http.put<Match>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + match.rencontre.id + "/match", match, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateMatchAndSets(match: Match, sets:Set[]):Observable<Match> {
        return this.http.put<Match>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + match.rencontre.id + "/match/sets?matchId="+match.id, sets, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteMatch(match: Match) {
        return this.http.delete<Match>(this.environmentService.getPrivateApiUrl() + "/match?id=" + match.id, this.authenticationService.getPrivateApiHttpOptions());
    }

}
