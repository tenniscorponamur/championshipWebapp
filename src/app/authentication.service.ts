import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { environment } from '../environments/environment';
import {User} from './user';
import {LocalStorageService} from './local-storage.service';
import {EnvironmentService} from './environment.service';

@Injectable()
export class AuthenticationService {

  private connectedUser:User;

  private clientId = environment.clientId;
  private clientPassword:string = environment.clientPassword;

  constructor(private http: HttpClient,
              private environmentService:EnvironmentService,
              private localStorageService: LocalStorageService
              ) { }

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

  isAdminUserConnected(){
    if (this.connectedUser!=null){
      let adminRole = this.connectedUser.roles.find(role => role=="ADMIN_USER");
      if (adminRole!=null){
        return true;
      }
    }
    return false;
  }

  getPublicApiHttpOptions(){
      return {
      headers: new HttpHeaders(
        {'Content-Type': 'application/json'}
        )
    };
  }

  getPrivateApiHttpOptions(){
    if (this.getAccessToken()!=null){
        return {
          headers: new HttpHeaders(
            {'Content-Type': 'application/json','Authorization': 'Bearer ' + this.getAccessToken()}
            )
        };
    }else{
      return {
          headers: new HttpHeaders(
            {'Content-Type': 'application/json'}
            )
        };
    }
  }

  disconnect() {
      this.localStorageService.removeAccessToken();
      this.localStorageService.removeRefreshToken();
      this.connectedUser=null;
  }

  getAccessToken():string{
    return this.localStorageService.getAccessToken();
  }

  getRefreshToken():string{
    return this.localStorageService.getRefreshToken();
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
    return this.http.post<any>(this.environmentService.getTokenUrl() + "?grant_type=password&username=" + login + "&password="+password,{}, this.getHttpOptionsForTokenRequest())
    .map(result => {
      this.storeAccessToken(result.access_token);
        if (rememberMe){
            this.storeRefreshToken(result.refresh_token);
        }
       return result;
     })
  }


  requestRefreshToken(): Observable<string> {
      return this.http.post<any>(this.environmentService.getTokenUrl() + "?grant_type=refresh_token&refresh_token=" + this.getRefreshToken(), {}, this.getHttpOptionsForTokenRequest())
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
      this.localStorageService.storeAccessToken(accessToken);
  }

  /**
   * Permet de stocker le token de rafraichissement
   */
  storeRefreshToken(refreshToken:string){
      this.localStorageService.storeRefreshToken(refreshToken);
  }

}
