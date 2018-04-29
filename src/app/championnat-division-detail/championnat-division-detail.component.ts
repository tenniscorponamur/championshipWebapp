import {Component, OnInit, Input} from '@angular/core';
import {Championnat, TypeChampionnat, getTypeChampionnat, getCategorieChampionnat, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES} from '../championnat';

@Component({
    selector: 'app-championnat-division-detail',
    templateUrl: './championnat-division-detail.component.html',
    styleUrls: ['./championnat-division-detail.component.css']
})
export class ChampionnatDivisionDetailComponent implements OnInit {

    constructor() {}

    ngOnInit() {
    }

    private _championnat: Championnat;
    private divisionHeaderClass: string= "card-header";

    @Input()
    set championnat(championnat: Championnat) {
        this._championnat = championnat;
        this.refreshDivisions();
    }

    get championnat(): Championnat {return this._championnat;}

    refreshDivisions() {
        this.refreshHeaderStyle();
        console.log("refresh divisions");
    }

    refreshHeaderStyle() {
        if (this._championnat) {
            if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code) {
                this.divisionHeaderClass = "card-header menDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code) {
                this.divisionHeaderClass = "card-header womenDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code) {
                this.divisionHeaderClass = "card-header mixteDivisionHeader";
            }else{
                this.divisionHeaderClass = "card-header";
            }
        }
    }

    getTypeChampionnat(championnat: Championnat): TypeChampionnat {
        return getTypeChampionnat(championnat);
    }

    getCategorieChampionnat(championnat: Championnat): CategorieChampionnat {
        return getCategorieChampionnat(championnat);
    }

}
