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
    
  constructor(public dialog: MatDialog) {
    super();
  }

  ngOnInit() {
      //TODO : initialiser la liste des matchs (6 pour une rencontre classique)
      //TODO : sur base du numero d'ordre, recuperer ceux enregistres et preparer les autres pour l'enregistrement
      this.matchs=this.createNewMatchs();
      
  }

  private _rencontre: Rencontre;

  @Input()
  set rencontre(rencontre: Rencontre) {
    this._rencontre = rencontre;
    console.log("rencontre selected");
  }

  get rencontre(): Rencontre { return this._rencontre; }

  createNewMatchs():Match[]{
      let newMatchs:Match[] = [];
      
      // 4 matchs simples
      
      for (var i=0;i<4;i++){
          let match = new Match();
          match.type=MATCH_SIMPLE;
          match.ordre = i+1;
          newMatchs.push(match);
      }
      
      // 2 matchs doubles
      
      for (var i=0;i<2;i++){
          let match = new Match();
          match.type=MATCH_DOUBLE;
          match.ordre = i+1;
          newMatchs.push(match);
      }
      
      return newMatchs;
  }
  
  getMatchIdent(match:Match):string{
      return (match.type == MATCH_SIMPLE?"S":"D") + "#" + match.ordre;
  }
  
    isDouble(match:Match){
        return match.type==MATCH_DOUBLE;
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
            
        }
    });
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
