import {Club} from "./club";
import {ClassementCorpo} from "./classementCorpo";
import {ClassementAFT} from "./classementAFT";

export class Membre {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  actif: boolean;
  genre: string;
  club:Club;
  capitaine: boolean;
  responsableClub: boolean;
  dateAffiliationCorpo: Date;
  dateDesaffiliationCorpo: Date;
  numeroAft: string;
  numeroClubAft: string;
  dateAffiliationAft: Date;
  onlyCorpo: boolean;
  classementCorpoActuel:ClassementCorpo;
  classementAFTActuel:ClassementAFT;
}
