import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { environment } from '../environments/environment';

@Injectable()
export class AuthenticationService {

  private tokenUrl = environment.tokenUrl;
  private clientId = environment.clientId;
  private clientPassword:string = environment.clientPassword;

  constructor(private http: HttpClient) { }

  //TODO : stocker correctement le jeton et prevoir une methode unique pour la recuperation du jeton --> appel ou localStorage

  login() {
    this.getToken().subscribe(
        result => {
            if (result){
                localStorage.setItem("tennisCorpoAccessToken",result.access_token);
                localStorage.setItem("tennisCorpoRefreshToken",result.refresh_token);
            }
          }
      );
  }

  disconnect() {
      localStorage.removeItem("tennisCorpoAccessToken");
      localStorage.removeItem("tennisCorpoRefreshToken");
  }

  getAccessToken():string{
    return localStorage.getItem("tennisCorpoAccessToken");
  }

  getRefreshToken():string{
    return localStorage.getItem("tennisCorpoRefreshToken");
  }

  refreshToken(): Observable<string> {

    let httpAuthOptions = {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json',
         'Authorization':'Basic ' + btoa(this.clientId + ":" + this.clientPassword)
        }
        )
    };

    return this.http.post<any>("http://localhost:9100/oauth/token?grant_type=refresh_token&refresh_token=" + this.getRefreshToken(),{}, httpAuthOptions)
      .pipe(
          tap(result => {
                localStorage.setItem("tennisCorpoAccessToken",result.access_token);
                localStorage.setItem("tennisCorpoRefreshToken",result.refresh_token);
          }),
          catchError(this.handleError<any>('getRefreshToken', 'dfgfgdsgdsgsdgsdg'))
      );
  }

  getToken() : Observable<any> {

    let httpAuthOptions = {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json',
        'Authorization':'Basic ' + btoa(this.clientId + ":" + this.clientPassword)}
        )
    };

    return this.http.post<any>("http://localhost:9100/oauth/token?grant_type=password&username=fca&password=jwtpass",{}, httpAuthOptions)
      .pipe(
          tap(result => {console.log("token obtained");}),
          catchError(this.handleError<any>('getToken', ''))
      );
  }

  //TODO : a deplacer dans le service approprie

  getUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json'}
        )
    };

    return this.http.get<any>("http://localhost:9100/api/private/user", httpOptions)
      .pipe(
          tap(result => {
                console.log("it s ok : " + result.principal);
            }),
          catchError(this.handleError<String>('testAppel', ))
      );
  }

    addHeaderIfNecessary():void {

    }

  /*
  addTokenIfEmpty(req: HttpRequest<any>, token: string): HttpRequest<any> {
      if (req.headers.get("Authorization")){
        return req;
      }else{
        return req.clone({ headers : req.headers.set("Authorization", 'Bearer ' + token)});
      }
  }
  */

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
