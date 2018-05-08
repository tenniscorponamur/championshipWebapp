import {Championnat, TypeChampionnat, CategorieChampionnat, getTypeChampionnat, getCategorieChampionnat, TYPE_CHAMPIONNAT_HIVER, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';

export abstract class ChampionnatDetailComponent {
    
    getTypeChampionnat(championnat: Championnat): TypeChampionnat {
        return getTypeChampionnat(championnat);
    }

    getCategorieChampionnat(championnat: Championnat): CategorieChampionnat {
        return getCategorieChampionnat(championnat);
    }

    getTrophyClass(championnat: Championnat) {
        if (championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code) {
            return "fa fa-trophy menChampionship";
        } else if (championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code) {
            return "fa fa-trophy womenChampionship";
        } else if (championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code) {
            return "fa fa-trophy mixteChampionship";
        }
        return ""; 
    }

    getChampionshipHeader(championnat: Championnat) {
        if (championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code) {
            return "menChampionshipHeader";
        } else if (championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code) {
            return "womenChampionshipHeader";
        } else if (championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code) {
            return "mixteChampionshipHeader";
        }
        return "";
    }

    getTypeClass(championnat: Championnat) {
        if (championnat.type == TYPE_CHAMPIONNAT_HIVER.code) {
            return "fa fa-snowflake-o winterTrophyType";
        } else if (championnat.type == TYPE_CHAMPIONNAT_ETE.code) {
            return "fa fa-sun-o summerTrophyType";
        } else if (championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code) {
            return "fa fa-star criteriumTrophyType";
        }
        return "";
    }

    getTypeIcon(championnat: Championnat) {
        if (championnat.type == TYPE_CHAMPIONNAT_HIVER.code) {
            return "fa fa-snowflake-o";
        } else if (championnat.type == TYPE_CHAMPIONNAT_ETE.code) {
            return "fa fa-sun-o";
        } else if (championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code) {
            return "fa fa-star";
        }
        return "";
    }
}