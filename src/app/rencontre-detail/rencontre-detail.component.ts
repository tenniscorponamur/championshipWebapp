import { Component, Inject, OnInit, Input } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare,addLeadingZero} from '../utility';
import {MatchService} from '../match.service';
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

    matchs:MatchExtended[]=[];

  constructor(public dialog: MatDialog,
  private matchService:MatchService,
  private setService:SetService) {
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

  get rencontre(): Rencontre { return this._rencontre; }

  getMatchs() {

    this.matchs=[];

    // Recuperation des matchs de la rencontre ou creation a la volee s'ils n'existent pas

      this.matchService.getMatchs(this.rencontre.id).subscribe(matchs => {

        matchs.forEach(
          match => {
            let matchExtended:MatchExtended = new MatchExtended();
            matchExtended.match = match;

            this.matchs.push(matchExtended);

            this.setService.getSets(match.id).subscribe(sets => matchExtended.sets=sets.sort((a,b) => compare(a.ordre,b.ordre,true)));

          });

        this.matchs = this.matchs.sort((a,b) => {
          if (a.match.type == b.match.type) {
            return compare(a.match.ordre,b.match.ordre,true);
          }else{
            if (a.match.type==MATCH_SIMPLE){
              return -1;
            }else{
             return 1;
            }
          }
        });

      }
      );
  }

  getMatchIdent(match:Match):string{
      return (match.type == MATCH_SIMPLE?"S":"D") + "#" + match.ordre;
  }

  isDouble(match:Match){
      return match.type==MATCH_DOUBLE;
  }

  isVisitesGagnant(match:Match):boolean{
    return false;
  }

  isVisiteursGagnant(match:Match):boolean{
    return false;
  }

  getVisitesClass(match:Match){
      if (this.isVisitesGagnant(match)){
          return "victorieux";
      }
      return "";
  }

  getVisiteursClass(match:Match){
      if (this.isVisiteursGagnant(match)){
          return "victorieux";
      }
      return "";
  }

  selectionnerJoueur(match:Match,indexEquipe:number, indexJoueurEquipe:number): void {

      let club;
      if (indexEquipe==1){
          club = this.rencontre.equipeVisites.club;
      }else{
          club = this.rencontre.equipeVisiteurs.club;
      }

    let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
        data: {club: club}, panelClass: "membreSelectionDialog", disableClose:false
    });

    membreSelectionRef.afterClosed().subscribe(membre => {
        if (membre){
            if (indexEquipe==1){
               if (indexJoueurEquipe==1){
                    match.joueurVisites1 = membre;
               }else{
                   match.joueurVisites2 = membre;
               }
            }else{
                if (indexJoueurEquipe==1){
                    match.joueurVisiteurs1 = membre;
               }else{
                   match.joueurVisiteurs2 = membre;
               }
            }

            this.sauverMatch(match);

        }
    });
  }

  sauverMatch(match:Match){
    this.matchService.updateMatch(match).subscribe();
  }

  sauverRencontre(){
    //TODO : sauver les points de la rencontre sur base des resultats des matchs
  }

    formatDate(date:Date):string{
        if (date){
            let dateToFormat=new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth()+1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        }else{
            return "";
        }
    }

  ouvrirResultats(matchExtended:MatchExtended){

    let resultatsDialogRef = this.dialog.open(ResultatsDialog, {
        data: {matchExtended:matchExtended}, panelClass: "resultatsDialog"
    });

    resultatsDialogRef.afterClosed().subscribe(matchExtended => {
        if (matchExtended){
          //TODO : refresh points rencontre
        }
    });

  }

}

class MatchExtended {

  match:Match;
  sets:Set[]=[];

}

@Component({
  selector: 'resultats-dialog',
  templateUrl: './resultatsDialog.html',
  styleUrls: ['./resultatsDialog.css']
})
export class ResultatsDialog {

  matchExtended:MatchExtended;
  set1JeuxVisites:number;
  set1JeuxVisiteurs:number;
  set1GagnantVisites:boolean;
  set1GagnantVisiteurs:boolean;

  set2JeuxVisites:number;
  set2JeuxVisiteurs:number;
  set2GagnantVisites:boolean;
  set2GagnantVisiteurs:boolean;

  set3JeuxVisites:number;
  set3JeuxVisiteurs:number;
  set3GagnantVisites:boolean;
  set3GagnantVisiteurs:boolean;

    showAlert:boolean=false;

  constructor(
    private setService:SetService,
    public dialogRef: MatDialogRef<ResultatsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.matchExtended = data.matchExtended;


    }

    cancel(): void {
      this.dialogRef.close();
    }

    save(): void {

        this.showAlert=false;

      //TODO : verifier la validite de l'encodage pour chaque set

      //this.setService.deleteSet();

        // TODO : supprimer les sets et les recreer pour enregistrer le resultat du match
        // et tenir compte de la reinitialisation possible d'un set (non-joue)


        //TODO : style pour gagnant du match
        //TODO : style pour gagnant du set
        //TODO : calcul des points du match
        //TODO : calcul des points de la rencontre

      //this.dialogRef.close(this.matchExtended);
    }

}

