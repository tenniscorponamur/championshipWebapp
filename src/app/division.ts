import {Championnat} from "./championnat";

export class Division {
    id: number;
    numero: number;
    pointsMinimum: number;
    pointsMaximum: number;
    championnat:Championnat;
    multiIS: boolean=false;
}
