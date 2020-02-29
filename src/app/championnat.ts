export class Championnat {
    id: number;
    annee: string;
    type: string;
    categorie: string;
    calendrierARafraichir:boolean;
    calendrierValide:boolean;
    cloture:boolean;
    ordre:number;

}

export function getCategorieChampionnat(championnat: Championnat): CategorieChampionnat {
    switch (championnat.categorie) {
        case CATEGORIE_CHAMPIONNAT_MESSIEURS.code:
            return CATEGORIE_CHAMPIONNAT_MESSIEURS;
        case CATEGORIE_CHAMPIONNAT_DAMES.code:
            return CATEGORIE_CHAMPIONNAT_DAMES;
        case CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code:
            return CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS;
        case CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code:
            return CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS;
        case CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code:
            return CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES;
        case CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code:
            return CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES;
        case CATEGORIE_CHAMPIONNAT_MIXTES.code:
            return CATEGORIE_CHAMPIONNAT_MIXTES;
        default:
            return null;
    }
}

export function getCategorieChampionnatCode(championnat: Championnat){
    switch (championnat.categorie) {
        case CATEGORIE_CHAMPIONNAT_MESSIEURS.code:
            return "M";
        case CATEGORIE_CHAMPIONNAT_DAMES.code:
            return "D";
        case CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code:
            return "SM";
        case CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code:
            return "DM";
        case CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code:
            return "SD";
        case CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code:
            return "DD";
        case CATEGORIE_CHAMPIONNAT_MIXTES.code:
            return "DMX";
        default:
            return null;
    }
}

export function getTypeChampionnat(championnat: Championnat): TypeChampionnat {
    switch (championnat.type) {
        case TYPE_CHAMPIONNAT_HIVER.code:
            return TYPE_CHAMPIONNAT_HIVER;
        case TYPE_CHAMPIONNAT_ETE.code:
            return TYPE_CHAMPIONNAT_ETE;
        case TYPE_CHAMPIONNAT_CRITERIUM.code:
            return TYPE_CHAMPIONNAT_CRITERIUM;
        case TYPE_CHAMPIONNAT_COUPE_HIVER.code:
            return TYPE_CHAMPIONNAT_COUPE_HIVER;
        default:
            return null;
    }
}

export class TypeChampionnat {
    code: string;
    libelle: string;
}

export class CategorieChampionnat {
    code: string;
    libelle: string;
}

export const TYPE_CHAMPIONNAT_HIVER: TypeChampionnat = {code: 'HIVER', libelle: 'Hiver'};
export const TYPE_CHAMPIONNAT_ETE: TypeChampionnat = {code: 'ETE', libelle: 'Eté'};
export const TYPE_CHAMPIONNAT_CRITERIUM: TypeChampionnat = {code: 'CRITERIUM', libelle: 'Critérium'};
export const TYPE_CHAMPIONNAT_COUPE_HIVER: TypeChampionnat = {code: 'COUPE_HIVER', libelle: 'Coupe d\'hiver'};
export const TYPES_CHAMPIONNAT: TypeChampionnat[] = [TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, TYPE_CHAMPIONNAT_COUPE_HIVER];

export const CATEGORIE_CHAMPIONNAT_MESSIEURS: CategorieChampionnat = {code: 'MESSIEURS', libelle: 'Messieurs'};
export const CATEGORIE_CHAMPIONNAT_DAMES: CategorieChampionnat = {code: 'DAMES', libelle: 'Dames'};
// Categories pour le criterium
export const CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS: CategorieChampionnat = {code: 'SIMPLE_MESSIEURS', libelle: 'Simples Messieurs'};
export const CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS: CategorieChampionnat = {code: 'DOUBLE_MESSIEURS', libelle: 'Doubles Messieurs'};
export const CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES: CategorieChampionnat = {code: 'SIMPLE_DAMES', libelle: 'Simples Dames'};
export const CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES: CategorieChampionnat = {code: 'DOUBLE_DAMES', libelle: 'Doubles Dames'};
export const CATEGORIE_CHAMPIONNAT_MIXTES: CategorieChampionnat = {code: 'MIXTES', libelle: 'Doubles Mixtes'};
export const CATEGORIES_CHAMPIONNAT: CategorieChampionnat[] = [
    CATEGORIE_CHAMPIONNAT_MESSIEURS, 
    CATEGORIE_CHAMPIONNAT_DAMES,
    CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS,
    CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS,
    CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES,
    CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES,
    CATEGORIE_CHAMPIONNAT_MIXTES
]


