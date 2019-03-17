import {Division} from "./division";
import {Poule} from "./poule";
import {Equipe} from "./equipe";
import {Terrain, Court} from "./terrain";
import {Membre} from "./membre";

export class Rencontre {
  id: number;
  numeroJournee:number;
  dateHeureRencontre: Date;
  division:Division;
  poule:Poule;
  equipeVisites: Equipe;
  equipeVisiteurs: Equipe;
  terrain:Terrain;
  court:Court; 
  pointsVisites:number;
  pointsVisiteurs:number;
  informationsInterserie:string;
  commentairesEncodeur:string;
  resultatsEncodes:boolean;
  valide:boolean;
}

export class AutorisationRencontre {
    id:number;
    rencontreFk:number;
    type:string;
    membre:Membre;
}

export const TYPE_AUTORISATION_ENCODAGE="ENCODAGE";
export const TYPE_AUTORISATION_VALIDATION="VALIDATION";
