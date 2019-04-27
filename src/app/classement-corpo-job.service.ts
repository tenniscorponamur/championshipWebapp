import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import {formatDate} from './utility';
import {EnvironmentService} from './environment.service';


@Injectable()
export class ClassementCorpoJobService {

  constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) { }

  getJobs(status:string):Observable<any[]>{
    return this.http.get<any[]>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/jobs?status="+status, this.authenticationService.getPrivateApiHttpOptions());
  }

  getJob(jobId:number):Observable<any>{
    return this.http.get<any>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/job/"+jobId, this.authenticationService.getPrivateApiHttpOptions());
  }

  getTraces(jobId:number):Observable<any[]>{
    return this.http.get<any[]>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/job/" + jobId + "/traces", this.authenticationService.getPrivateApiHttpOptions());
  }

  exportTraces(jobId:number):Observable<any[]>{
    let options = this.authenticationService.getPrivateApiHttpOptions();
    options["responseType"] = "blob";
    return this.http.get<any[]>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/job/" + jobId + "/traces/export", options);
  }

  launchJob(startDate:Date,avecSauvegarde:boolean){
    return this.http.post<any>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/job?startDate=" + formatDate(startDate) + "&avecSauvegarde=" + avecSauvegarde,null, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteJob(jobId:number){
    return this.http.delete<any>(this.environmentService.getPrivateApiUrl() + "/classementCorpo/job/" + jobId, this.authenticationService.getPrivateApiHttpOptions());
  }

}
