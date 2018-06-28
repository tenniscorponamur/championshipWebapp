import {Division} from "./division";
import {Poule} from "./poule";
import {Equipe} from "./equipe";
import {Terrain} from "./terrain";

export class Rencontre {
  id: number;
  numeroJournee:number;
  dateHeureRencontre: Date;
  division:Division;
  poule:Poule;
  equipeVisites: Equipe;
  equipeVisiteurs: Equipe;
  terrain:Terrain;
  pointsVisites:number;
  pointsVisiteurs:number;
  valide:boolean;
}
