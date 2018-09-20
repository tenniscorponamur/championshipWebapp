import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {Club} from './club';

@Injectable()
export class ClubService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(environment.publicApiUrl + "/clubs");
  }

  getClub(id:number): Observable<Club> {
    return this.http.get<Club>(environment.publicApiUrl + "/club?id="+id);
  }

  ajoutClub(club:Club){
    return this.http.post<Club>(environment.privateApiUrl + "/club",club, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateClub(club:Club){
      return this.http.put<Club>(environment.privateApiUrl + "/club",club, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteClub(club: Club) {
        return this.http.delete<Club>(environment.privateApiUrl + "/club?clubId=" + club.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isClubDeletable(club:Club) {
        return this.http.get<boolean>(environment.privateApiUrl + "/club/" + club.id + "/deletable", this.authenticationService.getPrivateApiHttpOptions());
    }


}
