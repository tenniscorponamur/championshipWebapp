import {Poule} from "./poule";
import {Equipe} from "./equipe";

export class Classement {
  poule:Poule;
  classementEquipes:ClassementEquipe[]=[];
}

export class ClassementEquipe {
  equipe:Equipe;
  points:number;
  matchsJoues:number;
  setsGagnes:number;
  setsPerdus:number;
  jeuxGagnes:number;
  jeuxPerdus:number;
  gagnantInterseries:boolean;
}
