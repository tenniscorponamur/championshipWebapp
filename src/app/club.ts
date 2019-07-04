import {Terrain} from "./terrain";

export class Club {
    id: number;
    numero:string;
    nom: string;
    description: string;
    numeroTVA: string;
    adresse: string;
    terrain:Terrain;
    actif: boolean=true;
}
