import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Trace} from './trace';

@Injectable()
export class TraceService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }
  
  getTraces(type:string, foreignKey:string): Observable<Trace[]> {
      return this.http.get<Trace[]>(environment.privateApiUrl + "/traces?type=" + type + "&foreignKey=" + foreignKey, this.authenticationService.getPrivateApiHttpOptions());
  }

}
