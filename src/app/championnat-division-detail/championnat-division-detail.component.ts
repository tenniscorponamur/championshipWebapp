import {Component, OnInit, Input, Inject} from '@angular/core';
import {Championnat, TypeChampionnat, getTypeChampionnat, getCategorieChampionnat, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, TYPES_CHAMPIONNAT, CATEGORIES_CHAMPIONNAT, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ChampionnatService} from '../championnat.service';

@Component({
    selector: 'app-championnat-division-detail',
    templateUrl: './championnat-division-detail.component.html',
    styleUrls: ['./championnat-division-detail.component.css']
})
export class ChampionnatDivisionDetailComponent implements OnInit {

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService) {}

    ngOnInit() {
    }

    private _championnat: Championnat;
    private divisionHeaderClass: string = "card-header";
    private trophyTypeClass: string = "";

    @Input()
    set championnat(championnat: Championnat) {
        this._championnat = championnat;
        this.refreshDivisions();
    }

    get championnat(): Championnat {return this._championnat;}

    refreshDivisions() {
        this.refreshStyles();
        console.log("refresh divisions");
    }

    refreshStyles() {
        if (this._championnat) {
            if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code) {
                this.divisionHeaderClass = "card-header menDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code) {
                this.divisionHeaderClass = "card-header womenDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code) {
                this.divisionHeaderClass = "card-header mixteDivisionHeader";
            } else {
                this.divisionHeaderClass = "card-header";
            }
            
            
            if (this._championnat.type == TYPE_CHAMPIONNAT_HIVER.code) {
                this.trophyTypeClass = "fa fa-2x fa-snowflake-o winterTrophyType";
            } else if (this._championnat.type == TYPE_CHAMPIONNAT_ETE.code) {
                this.trophyTypeClass = "fa fa-2x fa-sun-o summerTrophyType";
            } else if (this._championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code) {
                this.trophyTypeClass = "fa fa-2x fa-star criteriumTrophyType";
            } else {
                this.trophyTypeClass = "";
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

@Component({
    selector: 'championnat-description-dialog',
    templateUrl: './championnatDescriptionDialog.html',
})
export class ChampionnatDescriptionDialog {

    types = TYPES_CHAMPIONNAT;
    categories = CATEGORIES_CHAMPIONNAT;

    _annee: number;
    _type: string;
    _categorie: string;

    showAlertNotNullable: boolean = false;
    showAlertDoublon: boolean = false;

    private _championnat: Championnat;

    constructor(
        public dialogRef: MatDialogRef<ChampionnatDescriptionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private championnatService: ChampionnatService) {

        this._championnat = data.championnat;
        this._annee = this._championnat.annee;
        this._type = this._championnat.type;
        this._categorie = this._championnat.categorie;

    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {

        this.showAlertNotNullable = false;
        this.showAlertDoublon = false;

        // Verification de l'annee
        if (this._annee) {
            //this.showAlert=false;
        } else {
            this.showAlertNotNullable = true;
        }

        // Verification du type
        if (this._type) {
            //this.showAlert=false;
        } else {
            this.showAlertNotNullable = true;
        }


        // Verification de la categorie
        if (this._categorie) {
            //this.showAlert=false;
        } else {
            this.showAlertNotNullable = true;
        }

        if (!this.showAlertNotNullable) {

            this._championnat.annee = this._annee;
            this._championnat.type = this._type;
            this._championnat.categorie = this._categorie;

            if (!this._championnat.id) {
                // Ajout d'un nouveal utilisateur
                this.championnatService.ajoutChampionnat(this._championnat).subscribe(
                    result => {
                        this.dialogRef.close(this._championnat);
                    },
                    error => {
                        this.showAlertDoublon = true;
                        console.log("Erreur lors de la sauvegarde --> doublon championnat par exemple");
                        console.log(error);
                    });
            } else {
                //Mise a jour de l'utilisateur
                this.championnatService.updateChampionnat(this._championnat).subscribe(
                    result => {
                        this.dialogRef.close(this._championnat);
                    },
                    error => {
                        this.showAlertDoublon = true;
                        console.log("Erreur lors de la sauvegarde --> doublon championnat par exemple");
                        console.log(error);
                    });
            }

        }

    }
}
