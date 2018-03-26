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

  login() {
    this.requestAccessToken().subscribe(
        result => {
            if (result){
                console.log("authentification reussie")
            }
          }
      );
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
  
  requestAccessToken() : Observable<any> {
    return this.http.post<any>(this.tokenUrl+ "?grant_type=password&username=fca&password=jwtpass",{}, this.getHttpOptionsForTokenRequest())
      .pipe(
          tap(result => {
                localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,result.access_token);
                localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,result.refresh_token);
                }),
          catchError(this.handleError<any>('getToken', ''))
      );
  }
  

  requestRefreshToken(): Observable<string> {
      return this.http.post<any>(this.tokenUrl + "?grant_type=refresh_token&refresh_token=" + this.getRefreshToken(), {}, this.getHttpOptionsForTokenRequest())
      .pipe(
          tap(result => {
            localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,result.access_token);
            localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,result.refresh_token);
          }),
          catchError(this.handleError<any>('getRefreshToken', 'dfgfgdsgdsgsdgsdg'))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
