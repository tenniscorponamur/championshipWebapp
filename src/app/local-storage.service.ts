import { Injectable } from '@angular/core';

const TENNIS_CORPO_COOKIE_PREF = "tennisCorpoCookiePref";

const TENNIS_CORPO_ACCESS_TOKEN_KEY = "tennisCorpoAccessToken";
const TENNIS_CORPO_REFRESH_TOKEN_KEY = "tennisCorpoRefreshToken";

const TENNIS_CORPO_CHAMPIONSHIP_KEY = "tennisCorpoChampionship";
const TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY = "tennisCorpoChampionshipIndex";
const TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY = "tennisCorpoChampionshipDivision";
const TENNIS_CORPO_CLUB_KEY = "tennisCorpoClub";

@Injectable()
export class LocalStorageService {

  constructor() { }

  //TODO : ne stocker des cookies que si on est autorise

  isCookieAuthorized():boolean{
      let cookiePref = this.getCookiePreference();
      return cookiePref=="true";
  }

  storeCookiePreference(cookiePref:string){
      localStorage.setItem(TENNIS_CORPO_COOKIE_PREF,cookiePref);
  }

  getCookiePreference():string{
      return localStorage.getItem(TENNIS_CORPO_COOKIE_PREF);
  }

  storeAccessToken(accessToken:string){
      if (this.isCookieAuthorized()){
        localStorage.setItem(TENNIS_CORPO_ACCESS_TOKEN_KEY,accessToken);
      }
  }

  getAccessToken():string{
    return localStorage.getItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
  }

  removeAccessToken(){
      localStorage.removeItem(TENNIS_CORPO_ACCESS_TOKEN_KEY);
  }

  storeRefreshToken(refreshToken:string){
    if (this.isCookieAuthorized()){
      localStorage.setItem(TENNIS_CORPO_REFRESH_TOKEN_KEY,refreshToken);
    }
  }

  getRefreshToken():string{
    return localStorage.getItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(){
      localStorage.removeItem(TENNIS_CORPO_REFRESH_TOKEN_KEY);
  }

  storeChampionshipKey(championshipKey:string){
    if (this.isCookieAuthorized()){
      localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_KEY,championshipKey);
    }
  }

  getChampionshipKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_KEY);
  }

  storeChampionshipIndexKey(championshipIndexKey:string){
    if (this.isCookieAuthorized()){
      localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY,championshipIndexKey);
    }
  }

  getChampionshipIndexKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY);
  }

  storeChampionshipDivisionKey(championshipDivisionKey:string){
    if (this.isCookieAuthorized()){
      localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY,championshipDivisionKey);
    }
  }

  getChampionshipDivisionKey(){
    return localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY);
  }

  storeClubKey(clubKey:string){
    if (this.isCookieAuthorized()){
      localStorage.setItem(TENNIS_CORPO_CLUB_KEY,clubKey);
    }
  }

  getClubKey(){
    return localStorage.getItem(TENNIS_CORPO_CLUB_KEY);
  }

  clearLocalStorage(){
    localStorage.clear();
  }


}
