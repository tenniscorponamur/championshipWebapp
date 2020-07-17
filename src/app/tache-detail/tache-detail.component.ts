import { Component, OnInit, Input, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Tache, getTypeTacheAsString, TYPE_TACHE_NOUVEAU_MEMBRE, TYPE_TACHE_DESACTIVATION_MEMBRE, TYPE_TACHE_REACTIVATION_MEMBRE, TYPE_TACHE_CHANGEMENT_POINTS} from '../tache';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import {TacheService} from '../tache.service';
import {MembreService} from '../membre.service';
import {ClassementMembreService} from '../classement-membre.service';

@Component({
  selector: 'app-tache-detail',
  templateUrl: './tache-detail.component.html',
  styleUrls: ['./tache-detail.component.css']
})
export class TacheDetailComponent implements OnInit {

  private _tache:Tache;

  @Input()
  set tache(tache:Tache) {
      this._tache = tache;
  }

  get tache(): Tache { return this._tache; }

  get userImage():String {
    if (this._tache) {
        if (this._tache.membre.genre == GENRE_HOMME.code){
          return "fa fa-male fa-2x maleMember";
      }else{
          return "fa fa-female fa-2x femaleMember";
      }
    }
    return "";
  }

  constructor(
        public dialog: MatDialog
    ) {
  }

  ngOnInit() {
  }

  getTypeTache(){
    return getTypeTacheAsString(this.tache);
  }

  isNouveauMembre() {
    return this.tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE;
  }

  validerDemande(){
     if (this.isNouveauMembre()){
      let validationNouveauMembreDialogRef = this.dialog.open(ValidationNouveauMembreDialog, {
          data: { tache:this.tache }, panelClass: "validationNouveauMembreDialog", disableClose:true
      });
     }
  }

  refuserDemande(){
      let refusDialogRef = this.dialog.open(RefusDialog, {
          data: { tache:this.tache }, panelClass: "refusDialog", disableClose:true
      });
  }


}

@Component({
    selector: 'validation-nouveau-membre-dialog',
    templateUrl: './validationNouveauMembre.html'
})
export class ValidationNouveauMembreDialog implements OnInit {

    private tache:Tache;

    echellesCorpo:any[]=[];

    numeroAft:string;
    pointsCorpo:number;
    alerte:string;

    constructor(
        private tacheService:TacheService,
        private membreService:MembreService,
        private classementMembreService: ClassementMembreService,
        public dialogRef: MatDialogRef<ValidationNouveauMembreDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.tache = data.tache;
          this.numeroAft = this.tache.membre.numeroAft;
          this.pointsCorpo = this.tache.pointsCorpo;
        }

    ngOnInit() {
      this.classementMembreService.getEchellesCorpo().subscribe(echelles => {
          this.echellesCorpo = echelles;
      });
    }

  cancel(){
    this.dialogRef.close();
  }

  save(){
    if (this.numeroAft!=null && this.numeroAft.length > 0 && this.pointsCorpo!=null){

      this.membreService.findMembreByNumeroAft(this.numeroAft).subscribe(membre => {
         if (membre != null){
           if (membre.fictif){
              this.alerte = "Une demande a déjà été introduite pour ce numéro AFT.";
           }else if (membre.actif){
              this.alerte = "Un membre actif possède déjà ce numéro AFT.";
           }else if (!membre.actif){
              this.alerte = "Un membre inactif possède déjà ce numéro AFT.";
           }
         }else{

          this.tacheService.traitementTache(this.tache, this.numeroAft, this.pointsCorpo, true, null).subscribe(tacheSaved => {
              if (tacheSaved){
                this.tache.dateTraitement = tacheSaved.dateTraitement;
                this.tache.agentTraitant = tacheSaved.agentTraitant;
                this.tache.validationTraitement = tacheSaved.validationTraitement;
                this.tache.refusTraitement = tacheSaved.refusTraitement;
                this.tache.commentairesRefus = tacheSaved.commentairesRefus;
                this.dialogRef.close();
              }
            });

         }
      });
    }else{
      this.alerte = "Veuillez préciser un numéro AFT";
    }

  }

}

@Component({
    selector: 'refus-demande-dialog',
    templateUrl: './refusDemande.html'
})
export class RefusDialog implements OnInit {

    private tache:Tache;
    comments:string;

    constructor(
        private tacheService:TacheService,
        public dialogRef: MatDialogRef<RefusDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.tache = data.tache;
        }

    ngOnInit() {
    }

    cancel(){
      this.dialogRef.close();
    }

    save(){
          this.tacheService.traitementTache(this.tache, null, null, false, this.comments).subscribe(tacheSaved => {
              if (tacheSaved){
                this.tache.dateTraitement = tacheSaved.dateTraitement;
                this.tache.agentTraitant = tacheSaved.agentTraitant;
                this.tache.validationTraitement = tacheSaved.validationTraitement;
                this.tache.refusTraitement = tacheSaved.refusTraitement;
                this.tache.commentairesRefus = tacheSaved.commentairesRefus;
                this.dialogRef.close();
              }
            });
    }
}

