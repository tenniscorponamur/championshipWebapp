import { Injectable } from '@angular/core';

const TENNIS_CORPO_ACCESS_TOKEN_KEY = "tennisCorpoAccessToken";
const TENNIS_CORPO_REFRESH_TOKEN_KEY = "tennisCorpoRefreshToken";

const TENNIS_CORPO_CHAMPIONSHIP_KEY = "tennisCorpoChampionship";
const TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY = "tennisCorpoChampionshipIndex";
const TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY = "tennisCorpoChampionshipDivision";

@Injectable()
export class LocalStorageService {

  constructor() { }

  storeAccessToken(accessToken:string){
      localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,accessToken);
  }

  getAccessToken():string{
    return localStorage.getItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
  }

  removeAccessToken(){
      localStorage.removeItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
  }

  storeRefreshToken(refreshToken:string){
      localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,refreshToken);
  }

  getRefreshToken():string{
    return localStorage.getItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(){
      localStorage.removeItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  storeChampionshipKey(championshipKey:string){
    localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_KEY,championshipKey);
  }

  getChampionshipKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_KEY);
  }

  storeChampionshipIndexKey(championshipIndexKey:string){
    localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY,championshipIndexKey);
  }

  getChampionshipIndexKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY);
  }

  storeChampionshipDivisionKey(championshipDivisionKey:string){
    localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY,championshipDivisionKey);
  }

  getChampionshipDivisionKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY);
  }


}
