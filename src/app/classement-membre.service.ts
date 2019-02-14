import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {ClassementAFT} from './classementAFT';
import {ClassementCorpo} from './classementCorpo';
import {formatDate} from './utility';
import {EnvironmentService} from './environment.service';

@Injectable()
export class ClassementMembreService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }

  getEchellesCorpo():Observable<any[]>{
    return this.http.get<any[]>(this.environmentService.getPublicApiUrl() + "/echellesCorpo");
  }

  correspondanceEchelleCorpo():Observable<any>{
    return this.http.get<any>(this.environmentService.getPublicApiUrl() + "/echellesCorpo/correspondanceHommeFemme");
  }

  getEchellesAFT():Observable<any[]>{
    return this.http.get<any[]>(this.environmentService.getPublicApiUrl() + "/echellesAFT");
  }

  getOfficialAFT(numAft:string):Observable<any>{
     return this.http.get<any>(this.environmentService.getPrivateApiUrl() + "/officialAFT/" + numAft, this.authenticationService.getPrivateApiHttpOptions());
  }

  getClassementsAFTByMembre(membreId:number): Observable<ClassementAFT[]> {
    return this.http.get<ClassementAFT[]>(this.environmentService.getPublicApiUrl() + "/membre/" + membreId + "/classementsAFT");
  }

  getClassementsCorpoByMembre(membreId:number): Observable<ClassementCorpo[]> {
    return this.http.get<ClassementCorpo[]>(this.environmentService.getPublicApiUrl() + "/membre/" + membreId + "/classementsCorpo");
  }

  updateClassementsCorpo(membreId: number, classementsCorpo: ClassementCorpo[]) {
        return this.http.put<ClassementCorpo>(this.environmentService.getPrivateApiUrl() + "/membre/" + membreId + "/classementsCorpo", classementsCorpo, this.authenticationService.getPrivateApiHttpOptions());
    }

  simulationClassementCorpo(membreId: number, startDate:Date, endDate:Date): Observable<ClassementCorpo>{
    return this.http.get<ClassementCorpo>(this.environmentService.getPrivateApiUrl() + "/membre/" + membreId + "/classementCorpo/simulation?startDate=" + formatDate(startDate) + "&endDate=" + formatDate(endDate), this.authenticationService.getPrivateApiHttpOptions());
  }

  updateClassementsAFT(membreId: number, classementsAFT: ClassementAFT[]) {
        return this.http.put<ClassementAFT>(this.environmentService.getPrivateApiUrl() + "/membre/" + membreId + "/classementsAFT", classementsAFT, this.authenticationService.getPrivateApiHttpOptions());
    }
}
