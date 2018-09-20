import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import { Terrain } from './terrain';

@Injectable()
export class TerrainService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getTerrains(): Observable<Terrain[]> {
    return this.http.get<Terrain[]>(environment.publicApiUrl + "/terrains");
  }

  getTerrain(id:number): Observable<Terrain> {
    return this.http.get<Terrain>(environment.publicApiUrl + "/terrain?id="+id);
  }

  ajoutTerrain(terrain:Terrain){
    return this.http.post<Terrain>(environment.privateApiUrl + "/terrain",terrain, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateTerrain(terrain:Terrain){
      return this.http.put<Terrain>(environment.privateApiUrl + "/terrain",terrain, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteTerrain(terrain: Terrain) {
        return this.http.delete<Terrain>(environment.privateApiUrl + "/terrain?terrainId=" + terrain.id, this.authenticationService.getPrivateApiHttpOptions());
    }

    isTerrainDeletable(terrain:Terrain) {
        return this.http.get<boolean>(environment.privateApiUrl + "/terrain/" + terrain.id + "/deletable", this.authenticationService.getPrivateApiHttpOptions());
    }
}
