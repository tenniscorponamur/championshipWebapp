import {Championnat} from "./championnat";

export const TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY = "tennisCorpoChampionshipDivision";

export class Division {
    id: number;
    numero: number;
    pointsMinimum: number;
    pointsMaximum: number;
    championnat:Championnat;
}
