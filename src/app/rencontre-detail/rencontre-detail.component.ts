import { Component, Inject, OnInit, Input } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare,addLeadingZero} from '../utility';
import {MatchService} from '../match.service';
import {Match, MATCH_SIMPLE, MATCH_DOUBLE} from '../match';
import {MembreService} from '../membre.service';
import {Membre} from '../membre';
import {FormControl} from '@angular/forms';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Club} from '../club';
import {Equipe} from '../equipe';


@Component({
  selector: 'app-rencontre-detail',
  templateUrl: './rencontre-detail.component.html',
  styleUrls: ['./rencontre-detail.component.css']
})
export class RencontreDetailComponent extends ChampionnatDetailComponent implements OnInit {

    matchs:Match[]=[];

  constructor(public dialog: MatDialog,
  private matchService:MatchService) {
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
    // Recuperation des matchs de la rencontre ou creation a la volee s'ils n'existent pas
      this.matchService.getMatchs(this.rencontre.id).subscribe(matchs => this.matchs = matchs.sort((a,b) => {
        if (a.type == b.type) {
          return compare(a.ordre,b.ordre,true);
        }else{
          if (a.type==MATCH_SIMPLE){
            return -1;
          }else{
           return 1;
          }
        }
      })
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

    formatDate(date:Date):string{
        if (date){
            let dateToFormat=new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth()+1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        }else{
            return "";
        }
    }

}
