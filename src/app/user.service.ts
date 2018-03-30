import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';

@Injectable()
export class UserService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }


  getUser(): Observable<any> {
    return this.http.get<any>(environment.privateApiUrl + "/user", this.authenticationService.getPrivateApiHttpOptions());
  }
}
