import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Poule} from './poule';
import {EnvironmentService} from './environment.service';

@Injectable()
export class PouleService {

    constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getPoules(divisionId: number): Observable<Poule[]> {
        return this.http.get<Poule[]>(this.environmentService.getPublicApiUrl() + "/poules?divisionId=" + divisionId);
    }

    ajoutPoule(divisionId: number, poule: Poule) {
        return this.http.post<Poule>(this.environmentService.getPrivateApiUrl() + "/poule?divisionId=" + divisionId, poule, this.authenticationService.getPrivateApiHttpOptions());
    }

    updatePoule(divisionId: number, poule: Poule) {
        return this.http.put<Poule>(this.environmentService.getPrivateApiUrl() + "/poule?divisionId=" + divisionId, poule, this.authenticationService.getPrivateApiHttpOptions());
    }

    updatePouleAllerRetour(pouleId: number, allerRetour:boolean) {
        return this.http.put<Poule>(this.environmentService.getPrivateApiUrl() + "/poule/allerRetour?pouleId=" + pouleId + "&allerRetour=" + allerRetour, null, this.authenticationService.getPrivateApiHttpOptions());
    }

    deletePoule(poule: Poule) {
        return this.http.delete<Poule>(this.environmentService.getPrivateApiUrl() + "/poule?id=" + poule.id, this.authenticationService.getPrivateApiHttpOptions());
    }

}
