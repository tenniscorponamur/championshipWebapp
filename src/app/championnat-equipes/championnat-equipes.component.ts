import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';
import {Club} from '../club';
import {Championnat, TypeChampionnat, CategorieChampionnat, getTypeChampionnat, getCategorieChampionnat, TYPE_CHAMPIONNAT_HIVER, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';
import {FormControl} from '@angular/forms';
import {ChampionnatService} from '../championnat.service';

@Component({
    selector: 'app-championnat-equipes',
    templateUrl: './championnat-equipes.component.html',
    styleUrls: ['./championnat-equipes.component.css']
})
export class ChampionnatEquipesComponent implements OnInit {

    championnatCtrl: FormControl = new FormControl();

    championnats: Championnat[];
    selectedChampionnat:Championnat;

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService
    ) {
        this.championnatCtrl = new FormControl();
    }

    ngOnInit() {
        this.championnatService.getChampionnats().subscribe(championnats => this.championnats = championnats);
    }

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

    loadTeams() {
        console.log("load Teams");
        console.log("selectedChampionnat : " + this.selectedChampionnat.id);
    }

    refresh(championnat:Championnat) {
        console.log("refresh teams");
        
        this.selectedChampionnat = this.championnats.filter(championnatInList=>championnatInList.id==championnat.id)[0];
        
        this.loadTeams();
    }

    clubs = [
        {nom: "UNAMUR", equipe: 1, selected: false},
        {nom: "BNP FORTIS", equipe: 0, selected: true},
        {nom: "TC WALLONIE", equipe: 2, selected: false},
        {nom: "IATA", equipe: 0, selected: false},
        {nom: "GAZELEC", equipe: 1, selected: false},
        {nom: "RAIL", equipe: 0, selected: false},
        {nom: "POLICE NAMUR", equipe: 0, selected: false},
    ]
    fichier: File;

    loadFile() {
        console.log("load file " + this.fichier);
    }

    onChange(event) {
        var files: FileList = event.target.files;
        this.fichier = files.item(0);
        var fileReader: FileReader = new FileReader();
        //atob(this.fichier);
        fileReader.onloadend = function (e) {
            // you can perform an action with readed data here
            console.log(fileReader.result);
        }

        fileReader.readAsBinaryString(this.fichier);
    }

    displayTeam(data: any): boolean {
        return data.equipe > 0 || data.selected;
    }

    removeOneTeam(data: any) {
        if (data.equipe > 0) {
            data.equipe--;
        }
    }

    addOneTeam(data: any) {
        data.equipe++;
    }

    selectionClubs() {
        let clubDialogRef = this.dialog.open(SelectionClubDialog, {
            data: {}, panelClass: "selectionClubDialog", disableClose: false
        });

        clubDialogRef.afterClosed().subscribe(result => {
            console.log("selection des clubs termines")
        });
    }

    //TODO : ajouter une poule automatiquement s'il y a au moins une equipe
    //TODO : supprimer la poule si aucune equipe dans une division
}


@Component({
    selector: 'selection-club-dialog',
    templateUrl: './selectionClubDialog.html',
})
export class SelectionClubDialog {

    private clubs: Club[];

    constructor(
        public dialogRef: MatDialogRef<SelectionClubDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private clubService: ClubService) {

        this.clubService.getClubs().subscribe(clubs => {this.clubs = clubs;});

    }
}
