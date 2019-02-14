import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Division} from './division';
import {EnvironmentService} from './environment.service';

@Injectable()
export class DivisionService {

    constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getDivisions(championnatId: number): Observable<Division[]> {
        return this.http.get<Division[]>(this.environmentService.getPublicApiUrl() + "/divisions?championnatId=" + championnatId);
    }

    ajoutDivision(championnatId: number, division: Division) {
        return this.http.post<Division>(this.environmentService.getPrivateApiUrl() + "/division?championnatId=" + championnatId, division, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateDivision(championnatId: number, division: Division) {
        return this.http.put<Division>(this.environmentService.getPrivateApiUrl() + "/division?championnatId=" + championnatId, division, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    deleteDivision(division: Division) {
        return this.http.delete<Division>(this.environmentService.getPrivateApiUrl() + "/division?id=" + division.id, this.authenticationService.getPrivateApiHttpOptions());
    }
    
    updateDivisionList(championnatId: number, divisions: Division[]) {
        return this.http.put<Division>(this.environmentService.getPrivateApiUrl() + "/divisions?championnatId=" + championnatId, divisions, this.authenticationService.getPrivateApiHttpOptions());
    }

}
