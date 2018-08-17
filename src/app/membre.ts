import {Club} from "./club";
import {ClassementCorpo} from "./classementCorpo";

export class Membre {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  actif: boolean;
  genre: string;
  club:Club;
  capitaine: boolean;
  classementCorpoActuel:ClassementCorpo;
}
