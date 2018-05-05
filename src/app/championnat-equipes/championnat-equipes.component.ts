import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';
import {Club} from '../club';
import {Championnat, TypeChampionnat, CategorieChampionnat, getTypeChampionnat, getCategorieChampionnat, TYPE_CHAMPIONNAT_HIVER, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';
import {FormControl} from '@angular/forms';
import {ChampionnatService} from '../championnat.service';
import {Division} from '../division';
import {DivisionService} from '../division.service';
import {compare} from '../utility';
import {EquipeService} from '../equipe.service';
import {Equipe} from '../equipe';

@Component({
    selector: 'app-championnat-equipes',
    templateUrl: './championnat-equipes.component.html',
    styleUrls: ['./championnat-equipes.component.css']
})
export class ChampionnatEquipesComponent implements OnInit {

    championnatCtrl: FormControl = new FormControl();

    augmentedClubs: AugmentedClub[] = [];
    championnats: Championnat[];

    selectedChampionnat: Championnat;
    divisions: Division[];
    equipes: Equipe[] = [];

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private clubService: ClubService
    ) {
        this.championnatCtrl = new FormControl();
    }

    ngOnInit() {
        this.refresh(null);
        this.clubService.getClubs().subscribe(clubs => {
            clubs.forEach(club => this.augmentedClubs.push(new AugmentedClub(club, false)));
        });
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

    loadTeams() {
        this.equipes = [];
        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
                    this.divisions.forEach(division => {
                        this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
                            equipes.forEach(equipe => this.equipes.push(equipe));
                        });
                    });
                }
            );
        }
    }

    refresh(championnat: Championnat) {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort(
                (a, b) => {
                    let comparaisonAnnee = compare(a.annee, b.annee, false);
                    if (comparaisonAnnee != 0) {
                        return comparaisonAnnee;
                    } else {
                        let comparaisonType = compare(a.type, b.type, true);
                        if (comparaisonType != 0) {
                            return comparaisonType;
                        } else {
                            return compare(a.categorie, b.categorie, true);
                        }
                    }
                });

            if (championnat) {
                this.selectedChampionnat = this.championnats.filter(championnatInList => championnatInList.id == championnat.id)[0];
                this.loadTeams();
            }
        });
    }

    selectionClubs() {
        let clubDialogRef = this.dialog.open(SelectionClubDialog, {
            data: {augmentedClubs: this.augmentedClubs}, panelClass: "selectionClubDialog", disableClose: false
        });

        clubDialogRef.afterClosed().subscribe(result => {
            console.log("selection des clubs termines")
        });
    }

    displayTeam(augmentedClub: AugmentedClub, division: Division): boolean {
        return this.getNbEquipesByClubAndDivision(augmentedClub.club, division) > 0 || augmentedClub.selected;
    }

    removeOneTeam(club: Club, division: Division) {
        
        //TODO : si plus aucune equipe dans division, supprimer la poule 

        let indexOfTeam = this.equipes.findIndex(equipe => equipe.division.id == division.id && equipe.club.id == club.id);
        if (indexOfTeam != -1) {
            let equipeToDelete:Equipe = this.equipes.find((equipe,index) => indexOfTeam==index);
            this.equipeService.deleteEquipe(equipeToDelete).subscribe(result => 
            {
                this.equipes.splice(indexOfTeam, 1);
            });
        }
    }

    addOneTeam(club: Club, division: Division) {

        // TODO : Si premiere equipe, creation de la poule s'il n'y en a pas encore pour cette division 

        let equipe = new Equipe();
        equipe.division = division;
        equipe.club = club;
        
        this.equipeService.ajoutEquipe(division.id, equipe).subscribe(result => {
            this.equipes.push(equipe);
        })
        
    }

    getNbEquipesInChampionship() {
        return this.equipes.length;
    }

    getNbEquipesByDivision(division: Division) {
        return this.equipes.filter(equipe => equipe.division.id == division.id).length;
    }

    getNbEquipesByClub(club: Club) {
        return this.equipes.filter(equipe => equipe.club.id == club.id).length;
    }

    getNbEquipesByClubAndDivision(club: Club, division: Division): number {
        return this.equipes.filter(equipe => equipe.division.id == division.id).filter(equipe => equipe.club.id == club.id).length;
    }

    //TODO : ajouter une poule automatiquement s'il y a au moins une equipe
    //TODO : supprimer la poule si aucune equipe dans une div    ision


    //    fichier    : F    ile;
    //
    //    loadF    ile() {
    //        console.log("load file " + this.fi    chier);
    //        }
    //
    //    onChange(e    vent) {
    //        var files: FileList = event.target    .files;
    //        this.fichier = files.i    tem(0);
    //        var fileReader: FileReader = new FileRe    ader();
    //        //atob(this.fi    chier);
    //        fileReader.onloadend = functio    n (e) {
    //            // you can perform an action with readed da    ta here
    //            console.log(fileReader.r    esult);
    //                }
    //
    //        fileReader.readAsBinaryString(this.fi    chier);
    //    }


}

export class AugmentedClub {
    club: Club;
    selected: boolean;

    constructor(club: Club, selected: boolean) {
        this.club = club;
        this.selected = selected;
    }

}

@Component({
    selector: 'selection-club-dialog',
    templateUrl: './selectionClubDialog.html',
})
export class SelectionClubDialog {

    private augmentedClubs: AugmentedClub[];

    constructor(
        public dialogRef: MatDialogRef<SelectionClubDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.augmentedClubs = data.augmentedClubs;

    }

    selectAll(selected: boolean) {
        this.augmentedClubs.forEach(augmentedClub => augmentedClub.selected = selected);
    }

    fermerSelection() {
        this.dialogRef.close();
    }

}
