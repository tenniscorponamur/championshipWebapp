export class Championnat {
    id: number;
    annee: string;
    type: string;
    categorie: string;
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
export const CATEGORIES_CHAMPIONNAT: CategorieChampionnat[]=[CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES]


