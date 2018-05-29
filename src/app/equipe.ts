import {Club} from "./club";
import {Division} from "./division";
import {Poule} from "./poule";
import {Terrain} from "./terrain";
import {Membre} from "./membre";

export class Equipe {
    id: number;
    codeAlphabetique: string;
    division: Division;
    poule: Poule;
    club: Club;
    terrain:Terrain;
    capitaine:Membre;
}


