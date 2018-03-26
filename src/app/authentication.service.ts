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
                console.log("Je dois conserver mon jeton : " + result.access_token);
                localStorage.setItem("tennisCorpoAccessToken",result.access_token);
            }
          }
      );
  }

  disconnect() {
      localStorage.removeItem("tennisCorpoAccessToken");
  }

  getMyToken():string{
    return localStorage.getItem("tennisCorpoAccessToken");
  }

  /*


const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGVubmlzY29ycG9yZXNvdXJjZWlkIl0sInVzZXJfbmFtZSI6Imxlb3BvbGQiLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTIyMDI3Mjg3LCJhdXRob3JpdGllcyI6WyJBRE1JTl9VU0VSIl0sImp0aSI6IjUwMmEzZGZhLTMxMzMtNDc2OS1hMjI4LTAwNjI1OGVlNTMyOCIsImNsaWVudF9pZCI6InRlbm5pc2NvcnBvY2xpZW50aWQifQ.p6jDwfcQnDf1pe3Pdd9vZa8pBsQ8FDALWSPHIwaFVsc";


    clearSession(){
        localStorage.removeItem("tennisCorpoUser");
        //sessionStorage.removeItem("tennisCorpoUser");
        this.testEngine = null;
    }

  */

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
          catchError(this.handleError<any>('getToken', ))
      );
  }

  //TODO : a deplacer dans le service approprie

  getUser(): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json',
        'Authorization':'Bearer ' + this.getMyToken()}
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

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
