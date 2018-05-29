import {Division} from "./division";
import {Poule} from "./poule";
import {Equipe} from "./equipe";

export class Rencontre {
  id: number;
  numeroJournee:number;
  dateHeureRencontre: Date;
  division:Division;
  poule:Poule;
  equipeVisites: Equipe;
  equipeVisiteurs: Equipe;
  
}
