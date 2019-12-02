import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Club} from './club';
import {EnvironmentService} from './environment.service';

@Injectable()
export class ClubService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }

  getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.environmentService.getPublicApiUrl() + "/clubs");
  }

  getClub(id:number): Observable<Club> {
    return this.http.get<Club>(this.environmentService.getPublicApiUrl() + "/club?id="+id);
  }

  exportClubInformations(club:Club){
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get(this.environmentService.getPrivateApiUrl() + "/club/" + club.id + "/export",options);
  }

  ajoutClub(club:Club){
    return this.http.post<Club>(this.environmentService.getPrivateApiUrl() + "/club",club, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateClub(club:Club){
      return this.http.put<Club>(this.environmentService.getPrivateApiUrl() + "/club",club, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteClub(club: Club) {
        return this.http.delete<Club>(this.environmentService.getPrivateApiUrl() + "/club?clubId=" + club.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isClubDeletable(club:Club) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/club/" + club.id + "/deletable", this.authenticationService.getPrivateApiHttpOptions());
    }


}
