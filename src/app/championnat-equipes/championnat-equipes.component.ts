import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
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
import {PouleService} from '../poule.service';
import {Poule} from '../poule';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';

@Component({
    selector: 'app-championnat-equipes',
    templateUrl: './championnat-equipes.component.html',
    styleUrls: ['./championnat-equipes.component.css']
})
export class ChampionnatEquipesComponent extends ChampionnatDetailComponent implements OnInit {

    championnatCtrl: FormControl = new FormControl();

    @Output() selectChampionnat = new EventEmitter<Championnat>();

    augmentedClubs: AugmentedClub[] = [];
    championnats: Championnat[];

    selectedChampionnat: Championnat;
    divisions: Division[];
    equipes: Equipe[] = [];
    poules: Poule[] = [];

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private clubService: ClubService
    ) {
        super();
        this.championnatCtrl = new FormControl();
    }

    ngOnInit() {
        this.refresh(null,false);
        this.clubService.getClubs().subscribe(clubs => {
            clubs.forEach(club => this.augmentedClubs.push(new AugmentedClub(club, false)));
            this.augmentedClubs.sort((a,b) => compare(a.club.nom,b.club.nom,true));
        });
    }

    loadTeams() {

        this.selectChampionnat.emit(this.selectedChampionnat);

        this.equipes = [];
        this.poules=[];
        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
                    this.divisions.forEach(division => {
                        this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
                            equipes.forEach(equipe => this.equipes.push(equipe));
                        });
                        this.pouleService.getPoules(division.id).subscribe(poules => {
                            poules.forEach(poule => this.poules.push(poule));
                        });
                    });
                }
            );
        }
    }

    refresh(championnat: Championnat,flush:boolean) {
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
            }else{
                if (flush){
                    this.selectedChampionnat = null;
                }
            }
        });
    }

    selectionClubs() {
        let clubDialogRef = this.dialog.open(SelectionClubDialog, {
            data: {augmentedClubs: this.augmentedClubs}, panelClass: "selectionClubDialog", disableClose: false
        });
    }

    displayTeam(augmentedClub: AugmentedClub, division: Division): boolean {
        return this.getNbEquipesByClubAndDivision(augmentedClub.club, division) > 0 || augmentedClub.selected;
    }

    addOneTeam(club: Club, division: Division) {
        let equipe = new Equipe();
        equipe.division = division;
        equipe.club = club;
        if (club.terrain){
          equipe.terrain=club.terrain;
        }

        // On regarde s'il y a au moins une poule
        // S'il n'y en a pas encore, on va en creer une
        let nbPoulesInDivision = this.getNbPoulesInDivision(division);

        if (nbPoulesInDivision == 0) {

            // Creation d'une poule
            let poule = new Poule();
            poule.division = division;
            poule.numero = this.getNbPoulesInDivision(division) + 1;
            this.pouleService.ajoutPoule(division.id, poule).subscribe(newPoule => {
                this.poules.push(newPoule);
                equipe.poule=newPoule;
                this.ajoutEquipe(club,division,equipe);
            });

        }else{
            // On recupere la premiere poule de la division
            let poule = this.getPoulesByDivision(division).sort((a, b) => compare(a.numero, b.numero, true))[0];
            equipe.poule=poule;
            this.ajoutEquipe(club,division,equipe);

        }

    }

    ajoutEquipe(club:Club,division:Division,equipe:Equipe){
        this.equipeService.ajoutEquipe(division.id, equipe).subscribe(newEquipe => {
            equipe.id = newEquipe.id;
            this.equipes.push(equipe);

            // Renommage des equipes car le nom depend de la division a laquelle elle appartient
            this.nommageEquipe(club);

        });
    }

    removeOneTeam(club: Club, division: Division) {
        // On trie les equipes par nom descendant pour trouver la derniere equipe dans cette division

        let clubTeamsInDivision = this.getEquipesByClubAndDivision(club, division);

        if (clubTeamsInDivision.length > 0) {

            let sortedTeams = this.getEquipesByClubAndDivision(club, division).sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique, false));

            let equipeToDelete = sortedTeams[0];
            this.equipeService.deleteEquipe(equipeToDelete).subscribe(result => {
                let indexOfTeam = this.equipes.findIndex(equipe => equipe.id == equipeToDelete.id);
                this.equipes.splice(indexOfTeam, 1);
                // Renommage des equipes car le nom depend de la division a laquelle elle appartient
                this.nommageEquipe(club);

                // On regarde s'il reste des equipes dans la division
                // S'il n'y en a plus, on va supprimer les poules existantes

                let nbEquipesInDivision = this.getNbEquipesByDivision(division);
                if (nbEquipesInDivision == 0) {

                    this.getPoulesByDivision(division).forEach(pouleInDivision => {
                        this.pouleService.deletePoule(pouleInDivision).subscribe(result => {
                            let indexOfPoule = this.poules.findIndex(poule => poule.id == pouleInDivision.id);
                            this.poules.splice(indexOfPoule, 1);
                        });
                    });
                }
            });
        }

    }

    nommageEquipe(club: Club) {
        //TODO : idealement positionner ce renommage cote server
        let equipesClub = this.equipes.filter(equipe => equipe.club.id == club.id).sort((a, b) => {return compare(a.division.numero, b.division.numero, true);});
        equipesClub.forEach((equipe, index) => {
            equipe.codeAlphabetique = club.nom + " " + String.fromCharCode(97 + index).toUpperCase();
        });
        this.equipeService.updateEquipeNames(equipesClub).subscribe();
    }
//
//    addOnePoule(division: Division) {
//        let poule = new Poule();
//        poule.division = division;
//        poule.numero = this.getNbPoulesInDivision(division) + 1;
//        this.pouleService.ajoutPoule(division.id, poule).subscribe(newPoule => this.poules.push(newPoule));
//    }
//
//    removeOnePoule(division: Division) {
//
//        // On ne peut jamais supprimer la derniere poule, cela se fait automatiquement en supprimant la derniere equipe
//        // inscrite dans la division
//
//        let nbPoulesInDivision = this.getNbPoulesInDivision(division);
//        if (nbPoulesInDivision > 1) {
//            let pouleToDelete = this.getPoulesByDivision(division).sort((a, b) => compare(a.numero, b.numero, false))[0];
//            this.pouleService.deletePoule(pouleToDelete).subscribe(result => {
//                let indexOfPoule = this.poules.findIndex(poule => poule.id == pouleToDelete.id);
//                this.poules.splice(indexOfPoule, 1);
//            });
//        }
//    }

    getNbEquipesInChampionship() {
        return this.equipes.length;
    }

    getNbEquipesByDivision(division: Division) {
        return this.equipes.filter(equipe => equipe.division.id == division.id).length;
    }

    getNbEquipesByClub(club: Club) {
        return this.equipes.filter(equipe => equipe.club.id == club.id).length;
    }

    getEquipesByClubAndDivision(club: Club, division: Division) {
        return this.equipes.filter(equipe => equipe.division.id == division.id).filter(equipe => equipe.club.id == club.id);
    }

    getNbEquipesByClubAndDivision(club: Club, division: Division): number {
        return this.getEquipesByClubAndDivision(club, division).length;
    }

    getPoulesByDivision(division: Division) {
        return this.poules.filter(poule => poule.division.id == division.id);
    }

    getNbPoulesInDivision(division: Division) {
        return this.getPoulesByDivision(division).length;
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

    augmentedClubs: AugmentedClub[];

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
