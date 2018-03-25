import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGVubmlzY29ycG9yZXNvdXJjZWlkIl0sInVzZXJfbmFtZSI6Imxlb3BvbGQiLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNTIyMDI3Mjg3LCJhdXRob3JpdGllcyI6WyJBRE1JTl9VU0VSIl0sImp0aSI6IjUwMmEzZGZhLTMxMzMtNDc2OS1hMjI4LTAwNjI1OGVlNTMyOCIsImNsaWVudF9pZCI6InRlbm5pc2NvcnBvY2xpZW50aWQifQ.p6jDwfcQnDf1pe3Pdd9vZa8pBsQ8FDALWSPHIwaFVsc";
  
const httpOptions = {
  headers: new HttpHeaders( 
    {'Content-Type': 'application/json',
    'Authorization':'Bearer ' + token}
    )
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }
  
  testEngine:String;
  
  testAppel(): void {
    this.testAppelHttp().subscribe(testEngine => this.testEngine = testEngine);
  }

    testLectureSession(){
        this.testEngine = localStorage.getItem("tennisCorpoUser");
    }
    
    clearSession(){
        localStorage.removeItem("tennisCorpoUser");
        //sessionStorage.removeItem("tennisCorpoUser");
        this.testEngine = null;
    }
    
    
  testAppelHttp(): Observable<String> {
      console.log("test appel")
      
      
    return this.http.get<any>("http://localhost:9100/user", httpOptions)
      .pipe(
          tap(result => {console.log("it s ok : " + result.principal); localStorage.setItem("tennisCorpoUser",result.principal)}),
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
