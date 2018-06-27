import {Component, Inject, OnInit, Input} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare, addLeadingZero} from '../utility';
import {MatchService} from '../match.service';
import {RencontreService} from '../rencontre.service';
import {Match, MATCH_SIMPLE, MATCH_DOUBLE} from '../match';
import {MembreService} from '../membre.service';
import {SetService} from '../set.service';
import {Membre} from '../membre';
import {FormControl} from '@angular/forms';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Club} from '../club';
import {Set} from '../set';
import {Equipe} from '../equipe';


@Component({
    selector: 'app-rencontre-detail',
    templateUrl: './rencontre-detail.component.html',
    styleUrls: ['./rencontre-detail.component.css']
})
export class RencontreDetailComponent extends ChampionnatDetailComponent implements OnInit {

    matchs: MatchExtended[] = [];

    constructor(public dialog: MatDialog,
        private rencontreService:RencontreService,
        private matchService: MatchService,
        private setService: SetService) {
        super();
    }

    ngOnInit() {
    }

    private _rencontre: Rencontre;

    @Input()
    set rencontre(rencontre: Rencontre) {
        this._rencontre = rencontre;
        this.getMatchs();
    }

    get rencontre(): Rencontre {return this._rencontre;}

    getMatchs() {

        this.matchs = [];

        // Recuperation des matchs de la rencontre ou creation a la volee s'ils n'existent pas

        this.matchService.getMatchs(this.rencontre.id).subscribe(matchs => {

            matchs.forEach(
                match => {
                    let matchExtended: MatchExtended = new MatchExtended();
                    matchExtended.match = match;

                    this.matchs.push(matchExtended);

                    this.setService.getSets(match.id).subscribe(sets => matchExtended.sets = sets.sort((a, b) => compare(a.ordre, b.ordre, true)));

                });

            this.matchs = this.matchs.sort((a, b) => {
                if (a.match.type == b.match.type) {
                    return compare(a.match.ordre, b.match.ordre, true);
                } else {
                    if (a.match.type == MATCH_SIMPLE) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });

        }
        );
    }

    getMatchIdent(match: Match): string {
        return (match.type == MATCH_SIMPLE ? "S" : "D") + "#" + match.ordre;
    }

    isDouble(match: Match) {
        return match.type == MATCH_DOUBLE;
    }

    isVisitesGagnant(match: Match): boolean {
        return match.pointsVisites > match.pointsVisiteurs;
    }

    isVisiteursGagnant(match: Match): boolean {
        return match.pointsVisites < match.pointsVisiteurs;
    }

    getVisitesClass(match: Match) {
        if (this.isVisitesGagnant(match)) {
            return "victorieux";
        }
        return "";
    }

    getVisiteursClass(match: Match) {
        if (this.isVisiteursGagnant(match)) {
            return "victorieux";
        }
        return "";
    }

    getVisitesSetClass(set:Set) {
        if (set.jeuxVisites > set.jeuxVisiteurs) {
            return "victorieux";
        } else if (set.jeuxVisites < set.jeuxVisiteurs) {
            return "";
        } else {
            if (set.visitesGagnant==true) {
                return "victorieux"
            }
        }
        return "";
    }

    getVisiteursSetClass(set: Set) {
        if (set.jeuxVisites < set.jeuxVisiteurs) {
            return "victorieux";
        } else if (set.jeuxVisites > set.jeuxVisiteurs) {
            return "";
        } else {
            if (set.visitesGagnant==false) {
                return "victorieux"
            }
        }
        return "";
    }

    selectionnerJoueur(match: Match, indexEquipe: number, indexJoueurEquipe: number): void {

        let club;
        if (indexEquipe == 1) {
            club = this.rencontre.equipeVisites.club;
        } else {
            club = this.rencontre.equipeVisiteurs.club;
        }

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: club}, panelClass: "membreSelectionDialog", disableClose: false
        });

        membreSelectionRef.afterClosed().subscribe(membre => {
            if (membre) {
                if (indexEquipe == 1) {
                    if (indexJoueurEquipe == 1) {
                        match.joueurVisites1 = membre;
                    } else {
                        match.joueurVisites2 = membre;
                    }
                } else {
                    if (indexJoueurEquipe == 1) {
                        match.joueurVisiteurs1 = membre;
                    } else {
                        match.joueurVisiteurs2 = membre;
                    }
                }

                this.sauverMatch(match);

            }
        });
    }

    sauverMatch(match: Match) {
        this.matchService.updateMatch(match).subscribe();
    }

    formatDate(date: Date): string {
        if (date) {
            let dateToFormat = new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth() + 1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        } else {
            return "";
        }
    }

    ouvrirResultats(matchExtended: MatchExtended) {

        let resultatsDialogRef = this.dialog.open(ResultatsDialog, {
            data: {matchExtended: matchExtended}, panelClass: "resultatsDialog"
        });

        resultatsDialogRef.afterClosed().subscribe(matchExtended => {
            if (matchExtended) {
                this.refreshRencontre();
            }
        });

    }

    refreshRencontre() {
        this.calculMatchRencontre();
        // sauver les points de la rencontre sur base des resultats des matchs
        this.rencontreService.updateRencontre(this.rencontre).subscribe();
    }

    calculMatchRencontre(){
        this.rencontre.pointsVisites = null;
        this.rencontre.pointsVisiteurs = null;

        this.matchs.forEach(matchExtended => {
            if (matchExtended.match.pointsVisites!=null && matchExtended.match.pointsVisiteurs!=null){
              if (this.rencontre.pointsVisites==null){
                this.rencontre.pointsVisites=0;
              }
              if (this.rencontre.pointsVisiteurs==null){
                this.rencontre.pointsVisiteurs=0;
              }
              this.rencontre.pointsVisites = this.rencontre.pointsVisites + matchExtended.match.pointsVisites;
              this.rencontre.pointsVisiteurs = this.rencontre.pointsVisiteurs + matchExtended.match.pointsVisiteurs;
            }
        });
    }

}

class MatchExtended {

    match: Match;
    sets: Set[] = [];

}

@Component({
    selector: 'resultats-dialog',
    templateUrl: './resultatsDialog.html',
    styleUrls: ['./resultatsDialog.css']
})
export class ResultatsDialog {

    matchExtended: MatchExtended;

    set1JeuxVisites: number;
    set1JeuxVisiteurs: number;
    set1GagnantVisites: boolean = false;
    set1GagnantVisiteurs: boolean = false;

    set2JeuxVisites: number;
    set2JeuxVisiteurs: number;
    set2GagnantVisites: boolean = false;
    set2GagnantVisiteurs: boolean = false;

    set3JeuxVisites: number;
    set3JeuxVisiteurs: number;
    set3GagnantVisites: boolean = false;
    set3GagnantVisiteurs: boolean = false;

    showAlert: boolean = false;

    constructor(
        private matchService: MatchService,
        public dialogRef: MatDialogRef<ResultatsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.matchExtended = data.matchExtended;

        let set1 = this.matchExtended.sets.find(set => set.ordre == 1);
        if (set1) {
            this.set1JeuxVisites = set1.jeuxVisites;
            this.set1JeuxVisiteurs = set1.jeuxVisiteurs;
            if (set1.jeuxVisites == set1.jeuxVisiteurs) {
                this.set1GagnantVisites = set1.visitesGagnant == true;
                this.set1GagnantVisiteurs = set1.visitesGagnant == false;
            }
        }
        let set2 = this.matchExtended.sets.find(set => set.ordre == 2);
        if (set2) {
            this.set2JeuxVisites = set2.jeuxVisites;
            this.set2JeuxVisiteurs = set2.jeuxVisiteurs;
            if (set2.jeuxVisites == set2.jeuxVisiteurs) {
                this.set2GagnantVisites = set2.visitesGagnant == true;
                this.set2GagnantVisiteurs = set2.visitesGagnant == false;
            }
        }

        let set3 = this.matchExtended.sets.find(set => set.ordre == 3);
        if (set3) {
            this.set3JeuxVisites = set3.jeuxVisites;
            this.set3JeuxVisiteurs = set3.jeuxVisiteurs;
            if (set3.jeuxVisites == set3.jeuxVisiteurs) {
                this.set3GagnantVisites = set3.visitesGagnant == true;
                this.set3GagnantVisiteurs = set3.visitesGagnant == false;
            }
        }

    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {

        this.showAlert = false;
        let premierSet: boolean = false;
        let deuxiemeSet: boolean = false;
        let troisiemeSet: boolean = false;

        // Verifier la validite de l'encodage pour chaque set

        // Premier set

        if (this.set1JeuxVisites) {
            if (!this.set1JeuxVisiteurs) {
                this.showAlert = true;
            } else {
                // Jeux precises pour le premier set
                premierSet = true;
                if (this.set1JeuxVisites == this.set1JeuxVisiteurs) {
                    if (this.set1GagnantVisites) {
                        if (this.set1GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    } else {
                        if (!this.set1GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    }
                }
            }
        } else {
            if (this.set1JeuxVisiteurs) {
                this.showAlert = true;
            }
        }

        // Second set

        if (this.set2JeuxVisites) {
            if (!this.set2JeuxVisiteurs) {
                this.showAlert = true;
            } else {
                // Jeux precises pour le deuxieme set
                deuxiemeSet = true;
                if (this.set2JeuxVisites == this.set2JeuxVisiteurs) {
                    if (this.set2GagnantVisites) {
                        if (this.set2GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    } else {
                        if (!this.set2GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    }
                }
            }
        } else {
            if (this.set2JeuxVisiteurs) {
                this.showAlert = true;
            }
        }

        // Troisieme set

        if (this.set3JeuxVisites) {
            if (!this.set3JeuxVisiteurs) {
                this.showAlert = true;
            } else {
                // Jeux precises pour le troisieme set
                troisiemeSet = true;
                if (this.set3JeuxVisites == this.set3JeuxVisiteurs) {
                    if (this.set3GagnantVisites) {
                        if (this.set3GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    } else {
                        if (!this.set3GagnantVisiteurs) {
                            this.showAlert = true;
                        }
                    }
                }
            }
        } else {
            if (this.set3JeuxVisiteurs) {
                this.showAlert = true;
            }
        }

        if (!premierSet) {
            if (deuxiemeSet || troisiemeSet) {
                this.showAlert = true;
            }
        }

        if (!deuxiemeSet) {
            if (troisiemeSet) {
                this.showAlert = true;
            }
        }

        if (!this.showAlert) {

            let newSets:Set[] =[];

            if (premierSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 1;
                set.jeuxVisites = this.set1JeuxVisites;
                set.jeuxVisiteurs = this.set1JeuxVisiteurs;
                if (this.set1JeuxVisites == this.set1JeuxVisiteurs) {
                    set.visitesGagnant = this.set1GagnantVisites;
                }
                newSets.push(set);
            }

            if (deuxiemeSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 2;
                set.jeuxVisites = this.set2JeuxVisites;
                set.jeuxVisiteurs = this.set2JeuxVisiteurs;
                if (this.set2JeuxVisites == this.set2JeuxVisiteurs) {
                    set.visitesGagnant = this.set2GagnantVisites;
                }
                newSets.push(set);
            }

            if (troisiemeSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 3;
                set.jeuxVisites = this.set3JeuxVisites;
                set.jeuxVisiteurs = this.set3JeuxVisiteurs;
                if (this.set3JeuxVisites == this.set3JeuxVisiteurs) {
                    set.visitesGagnant = this.set3GagnantVisites;
                }
                newSets.push(set);
            }

            this.matchService.updateMatchAndSets(this.matchExtended.match, newSets).subscribe(match => {

                this.matchExtended.sets = newSets;

                this.matchExtended.match.pointsVisites = match.pointsVisites;
                this.matchExtended.match.pointsVisiteurs = match.pointsVisiteurs;

                this.dialogRef.close(this.matchExtended);

            });

        }
    }

    isDouble() {
        return this.matchExtended.match.type == MATCH_DOUBLE;
    }

}

