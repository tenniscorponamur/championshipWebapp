import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { environment } from '../environments/environment';

const TENNIS_CORPO_ACCESS_TOKEN_KEY = "tennisCorpoAccessToken";
const TENNIS_CORPO_REFRESH_TOKEN_KEY = "tennisCorpoRefreshToken";

@Injectable()
export class AuthenticationService {

  private tokenUrl = environment.tokenUrl;
  private clientId = environment.clientId;
  private clientPassword:string = environment.clientPassword;

  constructor(private http: HttpClient) { }

  getPublicApiHttpOptions(){
      return {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json'}
        )
    };
  }

  getPrivateApiHttpOptions(){
      return {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.getAccessToken()}
        )
    };
  }

  disconnect() {
      localStorage.removeItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
      localStorage.removeItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  getAccessToken():string{
    return localStorage.getItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
  }

  getRefreshToken():string{
    return localStorage.getItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  private getHttpOptionsForTokenRequest(){
    return {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json',
        'Authorization':'Basic ' + btoa(this.clientId + ":" + this.clientPassword)}
        )
    };
  }

  requestAccessToken(login:string, password:string) {
    return this.http.post<any>(this.tokenUrl+ "?grant_type=password&username=" + login + "&password="+password,{}, this.getHttpOptionsForTokenRequest())
    .map(result => {
       localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,result.access_token);
       localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,result.refresh_token);
       return result;
     })
     .catch(error => {
        return Observable.throw(error);
     })
  }


  requestRefreshToken(): Observable<string> {
      return this.http.post<any>(this.tokenUrl + "?grant_type=refresh_token&refresh_token=" + this.getRefreshToken(), {}, this.getHttpOptionsForTokenRequest())
      .map(result => {
         localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,result.access_token);
         localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,result.refresh_token);
         return result;
       })
       .catch(error => {
          return Observable.throw(error);
       })
  }

}
