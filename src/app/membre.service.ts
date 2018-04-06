import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

import { Membre } from './membre';
import { MEMBRES } from './mock-members';

@Injectable()
export class MembreService {

  constructor(private http: HttpClient) { }

  getMembres(): Observable<Membre[]> {
    return this.http.get<Membre[]>(environment.publicApiUrl + "/membres");
    //return of(MEMBRES);
  }

  searchMembres(nomPrenom:string): Observable<Membre[]> {
      return of(MEMBRES.filter(membre =>
            membre.nom.toLowerCase().includes(nomPrenom.toLowerCase())
         || membre.prenom.toLowerCase().includes(nomPrenom.toLowerCase())));
  }

  getMembre(id: number): Observable<Membre> {
//    return this.http.get<Player>(`${this.playersUrl}/${id}`)
//      .pipe(
//          tap(_ => this.log(`fetched player id = ${id} from server`)),
//          catchError(this.handleError<Player>(`getPlayer id=${id}`))
//      );
      return of(MEMBRES.find(membre => membre.id === id));
  }

  ajoutMembre(membre:Membre){
      MEMBRES.push(membre);
      membre.id = MEMBRES.length;
  }


}
