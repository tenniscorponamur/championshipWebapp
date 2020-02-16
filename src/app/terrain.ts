import {TypeChampionnat} from "./championnat";

export class Terrain {
  id: number;
  nom:string;
  description: string;
  adresse:string;
  terrainCriteriumParDefaut:boolean=false;
  showDrinkDetails:boolean=false;
  presenceBuvette:boolean=false;
  presenceBancontact:boolean=false;
  presencePayconiq:boolean=false;
  actif: boolean=true;
}

export class HoraireTerrain {
    id:number;
    terrain:Terrain;
    typeChampionnat:string;
    jourSemaine:number;
    heures:number;
    minutes:number;
}

export class Court {
    id:number;
    code:string;
    terrain:Terrain;
}

export class JourSemaine {
    code: number;
    libelle: string;
}

export const DIMANCHE:JourSemaine = {code:1,libelle:"Dimanche"};
export const LUNDI:JourSemaine = {code:2,libelle:"Lundi"};
export const MARDI:JourSemaine = {code:3,libelle:"Mardi"};
export const MERCREDI:JourSemaine = {code:4,libelle:"Mercredi"};
export const JEUDI:JourSemaine = {code:5,libelle:"Jeudi"};
export const VENDREDI:JourSemaine = {code:6,libelle:"Vendredi"};
export const SAMEDI:JourSemaine = {code:7,libelle:"Samedi"};

export const JOURS_SEMAINE:JourSemaine[]=[LUNDI,MARDI,MERCREDI,JEUDI,VENDREDI,SAMEDI,DIMANCHE];
