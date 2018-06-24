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

  addMatch(): void {
    let matchDialogRef = this.dialog.open(MatchDialog, {
        data: {rencontre: this.rencontre}, panelClass: "membreSelectionDialog", disableClose:false
    });

    matchDialogRef.afterClosed().subscribe(result => {
      console.log('Le match a ete ferme');
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

@Component({
  selector: 'match-dialog',
  templateUrl: './matchDialog.html',
  styleUrls: ['./matchDialog.css']
})
export class MatchDialog implements OnInit {

    private rencontre:Rencontre;
    listeJoueursVisites:Membre[]=[];
    listeJoueursVisiteurs:Membre[]=[];
    
    joueur1VisitesCtrl: FormControl = new FormControl();
    joueur1VisiteursCtrl: FormControl = new FormControl();
    joueur2VisitesCtrl: FormControl = new FormControl();
    joueur2VisiteursCtrl: FormControl = new FormControl();
    
    joueurVisites1Id:number;
    joueurVisiteurs1Id:number;
    joueurVisites2Id:number;
    joueurVisiteurs2Id:number;
    
    typeMatchs: string[] = [MATCH_SIMPLE, MATCH_DOUBLE];
    selectedTypeMatch:string=MATCH_SIMPLE;

  constructor(private matchService:MatchService,
    private membreService:MembreService,
    public dialogRef: MatDialogRef<MatchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.rencontre = data.rencontre;
        
        //TODO : initialiser les joueurs avec l'identifiant
    }
    
    ngOnInit(): void {
        this.membreService.getMembres(this.rencontre.equipeVisites.club.id).subscribe(membres => this.listeJoueursVisites = membres);
        this.membreService.getMembres(this.rencontre.equipeVisiteurs.club.id).subscribe(membres => this.listeJoueursVisiteurs = membres);
    }
    
    isDouble(){
        return this.selectedTypeMatch==MATCH_DOUBLE;
    }
    
  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      
      let match = new Match();
      match.rencontre = this.rencontre;
      match.ordre = 1;
      
      //find sur liste membre
//      
//      match.joueurVisites1 = this.joueurVisites1;
//      match.joueurVisiteurs1 = this.joueurVisiteurs1;
//      match.joueurVisites2 = this.joueurVisites2;
//      match.joueurVisiteurs2 = this.joueurVisiteurs2;

      this.matchService.ajoutMatch(match).subscribe();
            
    this.dialogRef.close();
  }

}
