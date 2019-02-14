import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {User} from './user';
import {EnvironmentService} from './environment.service';

@Injectable()
export class UserService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }


  getCurrentUser(): Observable<any> {
    return this.http.get<any>(this.environmentService.getPrivateApiUrl() + "/user/current", this.authenticationService.getPrivateApiHttpOptions());
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.environmentService.getPrivateApiUrl() + "/users", this.authenticationService.getPrivateApiHttpOptions());
  }

  ajoutUtilisateur(utilisateur:User){
    return this.http.post<User>(this.environmentService.getPrivateApiUrl() + "/user",utilisateur, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateUtilisateur(utilisateur:User){
      return this.http.put<User>(this.environmentService.getPrivateApiUrl() + "/user",utilisateur, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteUtilisateur(utilisateur: User) {
    return this.http.delete<User>(this.environmentService.getPrivateApiUrl() + "/user?userId=" + utilisateur.id, this.authenticationService.getPrivateApiHttpOptions());
  }
    
  resetPassword(utilisateur:User):Observable<boolean>{
      return this.http.post<boolean>(this.environmentService.getPrivateApiUrl() + "/user/resetPassword?id="+utilisateur.id,utilisateur, this.authenticationService.getPrivateApiHttpOptions());
  }

  changePassword(oldPassword:string,newPassword:string){
    return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/user/changePassword",{oldPassword:oldPassword,newPassword:newPassword}, this.authenticationService.getPrivateApiHttpOptions());
  }
  
  askPassword(numeroAft:string, captchaResponse:string):Observable<boolean>{
      return this.http.post<boolean>(this.environmentService.getPublicApiUrl() + "/user/askPassword?numeroAft="+numeroAft,captchaResponse);
  }


}
