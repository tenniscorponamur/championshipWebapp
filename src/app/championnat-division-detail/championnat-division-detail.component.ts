import {Component, OnInit, Input, Inject, Output, EventEmitter} from '@angular/core';
import {Championnat, TypeChampionnat, getTypeChampionnat, getCategorieChampionnat, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, TYPES_CHAMPIONNAT, CATEGORIES_CHAMPIONNAT, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, TYPE_CHAMPIONNAT_COUPE_HIVER} from '../championnat';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {ChampionnatService} from '../championnat.service';
import {Division} from '../division';
import {DivisionService} from '../division.service';
import {compare} from '../utility';

@Component({
    selector: 'app-championnat-division-detail',
    templateUrl: './championnat-division-detail.component.html',
    styleUrls: ['./championnat-division-detail.component.css']
})
export class ChampionnatDivisionDetailComponent implements OnInit {

    @Output() deleteChampionnat = new EventEmitter<Championnat>();

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService) {}

    ngOnInit() {
    }

    private _championnat: Championnat;
    private divisions: Division[];
    cloturable:boolean=false;

    divisionHeaderClass: string = "card-header";
    trophyTypeClass: string = "";
    showProgress = false;

    @Input()
    set championnat(championnat: Championnat) {
        this._championnat = championnat;
        this.refreshDivisions();
    }

    get championnat(): Championnat {return this._championnat;}

    get boxClass(): string{
      if (!this._championnat.calendrierValide){
        return "myBox myBoxEditable";
      }else{
        return "myBox";
      }
    }

    refreshDivisions() {
        this.refreshCloturable();
        this.refreshStyles();
        this.divisionService.getDivisions(this._championnat.id).subscribe(divisions => {
            this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true);});
        });
    }

    refreshCloturable(){
        this.championnatService.isCloturable(this.championnat).subscribe(cloturable => {this.cloturable = cloturable;});
    }

    refreshStyles() {
        if (this._championnat) {
            if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code
                || this._championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
                || this._championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code) {
                this.divisionHeaderClass = "card-header menDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code
                || this._championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
                || this._championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code) {
                this.divisionHeaderClass = "card-header womenDivisionHeader";
            } else if (this._championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code) {
                this.divisionHeaderClass = "card-header mixteDivisionHeader";
            } else {
                this.divisionHeaderClass = "card-header";
            }


            if (this._championnat.type == TYPE_CHAMPIONNAT_HIVER.code) {
                this.trophyTypeClass = "fa fa-2x fa-snowflake-o trophyType winterTrophyType";
            } else if (this._championnat.type == TYPE_CHAMPIONNAT_ETE.code) {
                this.trophyTypeClass = "fa fa-2x fa-sun-o trophyType summerTrophyType";
            } else if (this._championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code) {
                this.trophyTypeClass = "fa fa-2x fa-star trophyType criteriumTrophyType";
            } else if (this._championnat.type == TYPE_CHAMPIONNAT_COUPE_HIVER.code) {
                this.trophyTypeClass = "fa fa-2x fa-group trophyType coupeHiverTrophyType";
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

    ordreChanged(){
      this.championnatService.updateOrdreChampionnat(this._championnat).subscribe(
          championnatUpdated => {
          });
    }

    ouvrirChampionnat() {
        if (!this._championnat.calendrierValide){
          let championnatDescriptionDialogRef = this.dialog.open(ChampionnatDescriptionDialog, {
              data: {championnat: this.championnat}, panelClass: "championnatDescriptionDialog", disableClose:true
          });

          championnatDescriptionDialogRef.afterClosed().subscribe(result => {
              this.refreshStyles();
          });
        }
    }

    multiISChanged(division:Division){
        if (!this._championnat.calendrierValide){
          this.divisionService.updateDivision(this._championnat.id, division).subscribe();
        }
    }

    withFinalesChanged(division:Division){
        if (!this._championnat.calendrierValide){
          this.divisionService.updateDivision(this._championnat.id, division).subscribe();
        }
    }

    pointsMinChanged(division: Division) {
        if (!this._championnat.calendrierValide){
          if (division.pointsMinimum == null || division.pointsMinimum < 0) {
              division.pointsMinimum = 0;
          }
          if (division.pointsMinimum > division.pointsMaximum) {
              division.pointsMinimum = division.pointsMaximum;
          }
          this.divisionService.updateDivision(this._championnat.id, division).subscribe();
        }
    }

    pointsMaxChanged(division: Division) {
        if (!this._championnat.calendrierValide){
          if (division.pointsMaximum == null || division.pointsMaximum < 0) {
              division.pointsMaximum = 0;
          }

          if (division.pointsMinimum > division.pointsMaximum) {
              division.pointsMaximum = division.pointsMinimum;
          }

          this.divisionService.updateDivision(this._championnat.id, division).subscribe();

          let needSort: boolean = false;

          if (this.divisions.length > 1) {
              let divisionIndex = this.divisions.indexOf(division);
              if (divisionIndex == 0) {
                  // Look forward
                  let nextDivision = this.divisions.filter((divisionInList, index) => index == divisionIndex + 1)[0];
                  if (division.pointsMaximum < nextDivision.pointsMaximum) {
                      needSort = true;
                  }
              } else if (divisionIndex == this.divisions.length - 1) {
                  // Look backward
                  let previousDivision = this.divisions.filter((divisionInList, index) => index == divisionIndex - 1)[0];
                  if (division.pointsMaximum > previousDivision.pointsMaximum) {
                      needSort = true;
                  }
              } else {
                  // Look forward and backward
                  let nextDivision = this.divisions.filter((divisionInList, index) => index == divisionIndex + 1)[0];
                  if (division.pointsMaximum < nextDivision.pointsMaximum) {
                      needSort = true;
                  }
                  let previousDivision = this.divisions.filter((divisionInList, index) => index == divisionIndex - 1)[0];
                  if (division.pointsMaximum > previousDivision.pointsMaximum) {
                      needSort = true;
                  }
              }
          }

          if (needSort) {

              this.showProgress = true;
              setTimeout(() => {
                  this.divisions = this.divisions.sort((a, b) => {return compare(a.pointsMaximum, b.pointsMaximum, false);});
                  this.divisions.forEach((division, index) => division.numero = index + 1);
                  this.divisionService.updateDivisionList(this._championnat.id, this.divisions).subscribe(divisionList => this.showProgress = false);
              }, 500);

          }
        }

    }

    nouvelleDivision() {
        if (!this._championnat.calendrierValide){
          let division = new Division();
          division.numero = this.divisions.length + 1;
          division.pointsMinimum = 0;
          division.pointsMaximum = 0;
          this.divisionService.ajoutDivision(this._championnat.id, division).subscribe(
              newDivision => this.divisions.push(newDivision));
          ;
        }
    }

    supprimerDivision(division: Division) {
        this.divisionService.deleteDivision(division).subscribe(result => {
            this.divisions.splice(this.divisions.indexOf(division), 1);
            // renumerotation
            this.divisions.forEach((division, index) => division.numero = index + 1);
            this.divisionService.updateDivisionList(this._championnat.id, this.divisions).subscribe();
        });
    }

    cloturerChampionnat(){
        if (this._championnat.calendrierValide){
            this.championnatService.updateClotureChampionnat(this.championnat, true).subscribe(result => {
                if(result) {
                    this.championnat.cloture=true;
                    this.refreshCloturable();
                }
            });
        }
    }

    supprimerChampionnat(){
        if (!this._championnat.calendrierValide){
          this.deleteChampionnat.emit(this._championnat);
        }
    }
}

@Component({
    selector: 'championnat-description-dialog',
    templateUrl: './championnatDescriptionDialog.html',
    styleUrls: ['./championnatDescriptionDialog.css']
})
export class ChampionnatDescriptionDialog {

    types = TYPES_CHAMPIONNAT;

    categories:CategorieChampionnat[] = [];

    _annee: string;
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

        this.initCategories();
    }

    initCategories(){
        if (this._type == TYPE_CHAMPIONNAT_HIVER.code
            || this._type == TYPE_CHAMPIONNAT_ETE.code) {
            this.categories = [CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES];
        } else if (this._type == TYPE_CHAMPIONNAT_CRITERIUM.code){
            this.categories = [CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES];
        } else if (this._type == TYPE_CHAMPIONNAT_CRITERIUM.code){
            this.categories = [CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES];
        } else if (this._type == TYPE_CHAMPIONNAT_COUPE_HIVER.code){
            this.categories = [CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES];
        }

        // On reinitialise la categorie si elle ne se trouve pas dans la liste obtenue

        let selectedCategorie = this.categories.find(categorie => categorie.code == this._categorie);
        if (selectedCategorie==null){
            this._categorie = null;
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {

        this.showAlertNotNullable = false;
        this.showAlertDoublon = false;

        // Verification de l'annee
        if (this._annee != null && this._annee != undefined && this._annee.trim()!='') {
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
                // Ajout d'un nouveau championnat
                this.championnatService.ajoutChampionnat(this._championnat).subscribe(
                    newChampionnat => {
                        if (newChampionnat != null){
                          this._championnat.id = newChampionnat.id;
                          this.dialogRef.close(newChampionnat);
                        }else{
                          this.showAlertDoublon = true;
                          console.log("Erreur lors de la sauvegarde --> doublon championnat par exemple");
                        }
                    });
            } else {
                //Mise a jour du championnat
                this.championnatService.updateChampionnat(this._championnat).subscribe(
                    championnatUpdated => {
                        if (championnatUpdated != null){
                          this.dialogRef.close(championnatUpdated);
                        }else{
                          this.showAlertDoublon = true;
                          console.log("Erreur lors de la sauvegarde --> doublon championnat par exemple");
                        }
                    });
            }

        }

    }
}
