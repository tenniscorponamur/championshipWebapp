import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';
import { AuthenticationService } from './authentication.service';
import {Router} from '@angular/router';

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {

  isRefreshingToken: boolean = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private router:Router, private authenticationService: AuthenticationService) { }

  replayWithNewToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
     return req.clone({ headers : req.headers.set("Authorization", 'Bearer ' + token)});
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable< any > {
    return next.handle(req)
    .catch((error, caught) => {
      if (error instanceof HttpErrorResponse) {
            switch ((<HttpErrorResponse>error).status) {
                case 400:
                    return this.handle400Error(error);
                case 401:
                    return this.handle401Error(req, next);
            }
        } else {
            return Observable.throw(error);
        }
    }) as any;
  }

  handle400Error(error) {
      if (error && error.status === 400 && error.error && error.error.error === 'invalid_grant') {
          // If we get a 400 and the error message is 'invalid_grant', the token is no longer valid so logout.
          return this.logoutUser();
      }

      return Observable.throw(error);
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {

      if (!this.isRefreshingToken) {
          this.isRefreshingToken = true;

          // Reset here so that the following requests wait until the token
          // comes back from the refreshToken call.
          this.tokenSubject.next(null);

          return this.authenticationService.requestRefreshToken()
              .switchMap((newToken : any) => {
                  if (newToken.access_token) {
                      this.tokenSubject.next(newToken.access_token);
                      return next.handle(this.replayWithNewToken(req, newToken.access_token));
                  }

                  // If we don't get a new token, we are in trouble so logout.
                  return this.logoutUser();
              })
              .catch(error => {
                  // If there is an exception calling 'refreshToken', bad news so logout.
                  return this.logoutUser();
              })
              .finally(() => {
                  this.isRefreshingToken = false;
              });
      } else {
          return this.tokenSubject
              .filter(token => token != null)
              .take(1)
              .switchMap(token => {
                  return next.handle(this.replayWithNewToken(req, token));
              });
      }
  }


  logoutUser() {
      return Observable.throw("");
  }

}
