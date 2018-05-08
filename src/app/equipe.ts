import {Club} from "./club";
import {Division} from "./division";
import {Poule} from "./poule";

export class Equipe {
    id: number;
    codeAlphabetique: string;
    division: Division;
    poule: Poule;
    club: Club;

}


