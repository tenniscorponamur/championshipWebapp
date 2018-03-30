import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {tap, catchError} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  testEngine:string;
  private publicApiUrl:string = environment.publicApiUrl;
  private privateApiUrl:string = environment.privateApiUrl;

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  testAppelToken(){
    this.authenticationService.login().subscribe(
          result => {
              if (result){
                  console.log("authentification reussie")
              }
            }
        );
  }

  testDisconnect(){
    this.authenticationService.disconnect();
    this.testEngine=null;
  }

  testAppelUser() {
    this.getUser().subscribe(
        result => {
              if (result){
                this.testEngine=result.principal;
              }else{
                this.testEngine=null;
              }
          }
      );
  }


  //TODO : a deplacer dans le service approprie

  getUser(): Observable<any> {
    return this.http.get<any>(this.privateApiUrl + "/user", this.authenticationService.getPrivateApiHttpOptions())
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
      console.error(error); // log to console instead
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
