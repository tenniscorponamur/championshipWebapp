import {Division} from "./division";
import {Poule} from "./poule";
import {Equipe} from "./equipe";
import {Terrain, Court} from "./terrain";

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
  resultatsEncodes:boolean;
  valide:boolean;
}
