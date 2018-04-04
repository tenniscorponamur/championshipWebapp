import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {User} from './user';

@Injectable()
export class UserService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }


  getCurrentUser(): Observable<any> { 
    return this.http.get<any>(environment.privateApiUrl + "/user/current", this.authenticationService.getPrivateApiHttpOptions());
  }
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(environment.privateApiUrl + "/users", this.authenticationService.getPrivateApiHttpOptions());
  }
  
  ajoutUtilisateur(utilisateur:User){
    return this.http.post<User[]>(environment.privateApiUrl + "/user",utilisateur, this.authenticationService.getPrivateApiHttpOptions());
  }
  
  updateUtilisateur(utilisateur:User){
      return this.http.put<User[]>(environment.privateApiUrl + "/user",utilisateur, this.authenticationService.getPrivateApiHttpOptions());
  }
  
}
