import {Rencontre} from "./rencontre";
import {Membre} from "./membre";

export const MATCH_SIMPLE="SIMPLE";
export const MATCH_DOUBLE="DOUBLE";

export class Match {
  id: number;
  ordre:number;
  type:string;
  joueurVisites1:Membre;
  joueurVisites2:Membre;
  joueurVisiteurs1:Membre;
  joueurVisiteurs2:Membre;
  rencontre:Rencontre;
}


