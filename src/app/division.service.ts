import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Division} from './division';

@Injectable()
export class DivisionService {

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) {}

    getDivisions(championnatId: number): Observable<Division[]> {
        return this.http.get<Division[]>(environment.publicApiUrl + "/divisions?championnatId=" + championnatId);
    }

    ajoutDivision(championnatId: number, division: Division) {
        return this.http.post<Division>(environment.privateApiUrl + "/division?championnatId=" + championnatId, division, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateDivision(championnatId: number, division: Division) {
        return this.http.put<Division>(environment.privateApiUrl + "/division?championnatId=" + championnatId, division, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    deleteDivision(division: Division) {
        return this.http.delete<Division>(environment.privateApiUrl + "/division?id=" + division.id, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updateDivisionList(championnatId: number, divisions: Division[]) {
        return this.http.put<Division>(environment.privateApiUrl + "/divisions?championnatId=" + championnatId, divisions, this.authenticationService.getPrivateApiHttpOptions());
    }

}
