export const TENNIS_CORPO_CHAMPIONSHIP_KEY = "tennisCorpoChampionship";

export class Championnat {
    id: number;
    annee: number;
    type: string;
    categorie: string;

//    get categorieChampionnat():CategorieChampionnat{
//        return CATEGORIE_CHAMPIONNAT_MESSIEURS;
//    }

}

export function getCategorieChampionnat(championnat: Championnat): CategorieChampionnat {
    switch (championnat.categorie) {
        case CATEGORIE_CHAMPIONNAT_MESSIEURS.code:
            return CATEGORIE_CHAMPIONNAT_MESSIEURS;
        case CATEGORIE_CHAMPIONNAT_DAMES.code:
            return CATEGORIE_CHAMPIONNAT_DAMES;
        case CATEGORIE_CHAMPIONNAT_MIXTES.code:
            return CATEGORIE_CHAMPIONNAT_MIXTES;
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
export const TYPES_CHAMPIONNAT: TypeChampionnat[] = [TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM];

export const CATEGORIE_CHAMPIONNAT_MESSIEURS: CategorieChampionnat = {code: 'MESSIEURS', libelle: 'Messieurs'};
export const CATEGORIE_CHAMPIONNAT_DAMES: CategorieChampionnat = {code: 'DAMES', libelle: 'Dames'};
export const CATEGORIE_CHAMPIONNAT_MIXTES: CategorieChampionnat = {code: 'MIXTES', libelle: 'Mixtes'};
export const CATEGORIES_CHAMPIONNAT: CategorieChampionnat[] = [CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES]


