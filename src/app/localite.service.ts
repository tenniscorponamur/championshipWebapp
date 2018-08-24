import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Localite} from './localite';

@Injectable()
export class LocaliteService {

  constructor(private http: HttpClient){
   }

  getLocalites(): Observable<Localite[]> {
    return this.http.get<Localite[]>(environment.publicApiUrl + "/localites");
  }

}
