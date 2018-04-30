import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {Championnat} from './championnat';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class ChampionnatService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getChampionnats(): Observable<Championnat[]> {
    return this.http.get<Championnat[]>(environment.publicApiUrl + "/championnats");
  }

  ajoutChampionnat(championnat:Championnat){
    return this.http.post<Championnat>(environment.privateApiUrl + "/championnat",championnat, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateChampionnat(championnat:Championnat){
      return this.http.put<Championnat>(environment.privateApiUrl + "/championnat",championnat, this.authenticationService.getPrivateApiHttpOptions());
  }
  
}
