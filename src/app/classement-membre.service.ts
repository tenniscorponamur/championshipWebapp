import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {ClassementAFT} from './classementAFT';
import {ClassementCorpo} from './classementCorpo';

@Injectable()
export class ClassementMembreService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getEchellesCorpo():Observable<any[]>{
    return this.http.get<any[]>(environment.publicApiUrl + "/echellesCorpo");
  }

  getClassementsAFTByMembre(membreId:number): Observable<ClassementAFT[]> {
    return this.http.get<ClassementAFT[]>(environment.publicApiUrl + "/membre/" + membreId + "/classementsAFT");
  }

  getClassementsCorpoByMembre(membreId:number): Observable<ClassementCorpo[]> {
    return this.http.get<ClassementCorpo[]>(environment.publicApiUrl + "/membre/" + membreId + "/classementsCorpo");
  }

  updateClassementsCorpo(membreId: number, classementsCorpo: ClassementCorpo[]) {
        return this.http.put<ClassementCorpo>(environment.privateApiUrl + "/membre/" + membreId + "/classementsCorpo", classementsCorpo, this.authenticationService.getPrivateApiHttpOptions());
    }
}
