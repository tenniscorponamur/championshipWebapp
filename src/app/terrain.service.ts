import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import { environment } from '../environments/environment';
import { Terrain, HoraireTerrain, Court } from './terrain';

@Injectable()
export class TerrainService {

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

  getTerrains(): Observable<Terrain[]> {
    return this.http.get<Terrain[]>(environment.publicApiUrl + "/terrains");
  }

  getTerrain(id:number): Observable<Terrain> {
    return this.http.get<Terrain>(environment.publicApiUrl + "/terrain?id="+id);
  }

  getHorairesTerrain(terrain:Terrain): Observable<HoraireTerrain[]> {
    return this.http.get<HoraireTerrain[]>(environment.publicApiUrl + "/terrain/"+terrain.id+ "/horaires");
  }
  
  getCourtsTerrain(terrainId:number): Observable<Court[]> {
    return this.http.get<Court[]>(environment.publicApiUrl + "/terrain/"+terrainId+ "/courts");
  }

  getHorairesTerrainByTypeChampionnat(typeChampionnat:string): Observable<HoraireTerrain[]> {
    return this.http.get<HoraireTerrain[]>(environment.publicApiUrl + "/horairesTerrain?typeChampionnat="+ typeChampionnat);
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

  ajoutHoraireTerrain(terrain:Terrain,horaireTerrain:HoraireTerrain){
    return this.http.post<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/horaire", horaireTerrain, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateHoraireTerrain(terrain:Terrain,horaireTerrain:HoraireTerrain){
      return this.http.put<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/horaire", horaireTerrain, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteHoraireTerrain(terrain:Terrain,horaireTerrain: HoraireTerrain) {
      return this.http.delete<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/horaire?horaireTerrainId=" + horaireTerrain.id, this.authenticationService.getPrivateApiHttpOptions());
  }
  
  ajoutCourt(terrain:Terrain,court:Court){
    return this.http.post<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/court", court, this.authenticationService.getPrivateApiHttpOptions());
  }

  updateCourt(terrain:Terrain,court:Court){
      return this.http.put<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/court", court, this.authenticationService.getPrivateApiHttpOptions());
  }

  deleteCourt(terrain:Terrain,court:Court) {
      return this.http.delete<Terrain>(environment.privateApiUrl + "/terrain/" + terrain.id + "/court?courtId=" + court.id, this.authenticationService.getPrivateApiHttpOptions());
  }
}
