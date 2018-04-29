import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {Championnat} from './championnat';

@Injectable()
export class ChampionnatService {

  constructor(private http: HttpClient) { }

  getChampionnats(): Observable<Championnat[]> {
    return this.http.get<Championnat[]>(environment.publicApiUrl + "/championnats");
  }
  
}
