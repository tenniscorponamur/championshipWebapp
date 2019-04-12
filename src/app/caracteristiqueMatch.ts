import {Membre} from "./membre";
import {Match} from "./match";

export class CaracteristiqueMatch {
  match:Match;
  joueur:Membre;
  pointsJoueur:number;
  adversaire:Membre;
  pointsAdversaire:number;
  partenaire:Membre;
  pointsPartenaire:number;
  partenaireAdversaire:Membre;
  pointsPartenaireAdversaire:number;
  differencePoints:number;
  resultatMatch:string;
  pointsGagnesOuPerdus:number;
}
