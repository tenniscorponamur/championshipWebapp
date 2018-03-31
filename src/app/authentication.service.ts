import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { environment } from '../environments/environment';
import {User} from './user';

const TENNIS_CORPO_ACCESS_TOKEN_KEY = "tennisCorpoAccessToken";
const TENNIS_CORPO_REFRESH_TOKEN_KEY = "tennisCorpoRefreshToken";

@Injectable()
export class AuthenticationService {

  private connectedUser:User;

  private tokenUrl = environment.tokenUrl;
  private clientId = environment.clientId;
  private clientPassword:string = environment.clientPassword;

  constructor(private http: HttpClient) { }

  setConnectedUser(user:User){
      if (user){
          this.connectedUser = user;
      }
  }
  
  getConnectedUser():User{
      return this.connectedUser;
  }
  
  isConnected():boolean{
      return this.connectedUser!=null;
  }

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
      this.connectedUser=null;
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

  requestAccessToken(login:string, password:string, rememberMe:boolean) {
    return this.http.post<any>(this.tokenUrl+ "?grant_type=password&username=" + login + "&password="+password,{}, this.getHttpOptionsForTokenRequest())
    .map(result => {
      this.storeAccessToken(result.access_token);
        if (rememberMe){
            this.storeRefreshToken(result.refresh_token);
        }
       return result;
     })
  }


  requestRefreshToken(): Observable<string> {
      return this.http.post<any>(this.tokenUrl + "?grant_type=refresh_token&refresh_token=" + this.getRefreshToken(), {}, this.getHttpOptionsForTokenRequest())
      .map(result => {
          this.storeAccessToken(result.access_token);
          this.storeRefreshToken(result.refresh_token);
         return result;
       })
  }
  
  /**
   * Permet de stocker le token d'acces aux ressources
   */
  storeAccessToken(accessToken:string){
      localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,accessToken);
  }
  
  /**
   * Permet de stocker le token de rafraichissement
   */
  storeRefreshToken(refreshToken:string){
      localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,refreshToken);
  }

}
