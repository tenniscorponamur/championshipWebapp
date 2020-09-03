import { Component, OnInit, Input, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Tache, getTypeTacheAsString, TYPE_TACHE_NOUVEAU_MEMBRE, TYPE_TACHE_DESACTIVATION_MEMBRE, TYPE_TACHE_REACTIVATION_MEMBRE, TYPE_TACHE_CHANGEMENT_POINTS} from '../tache';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import {TacheService} from '../tache.service';
import {MembreService} from '../membre.service';
import {ClassementMembreService} from '../classement-membre.service';
import {AuthenticationService} from '../authentication.service';

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
        private tacheService:TacheService,
        private authenticationService: AuthenticationService,
        public dialog: MatDialog
    ) {
  }

  ngOnInit() {
  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  getTypeTache(){
    return getTypeTacheAsString(this.tache);
  }

  isNouveauMembre() {
    return this.tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE;
  }

  showPointsCorpo() {
    return this.tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE || this.tache.typeTache==TYPE_TACHE_REACTIVATION_MEMBRE || this.tache.typeTache==TYPE_TACHE_CHANGEMENT_POINTS;
  }

  showMembreLink(tache:Tache){
    if (this.tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE){
      if (this.tache.validationTraitement==true){
        return true;
      }
    }
    if (this.tache.typeTache==TYPE_TACHE_DESACTIVATION_MEMBRE){
      if (!this.tache.validationTraitement){
        return true;
      }
    }
    if (this.tache.typeTache==TYPE_TACHE_REACTIVATION_MEMBRE){
      if (this.tache.validationTraitement){
        return true;
      }
    }
    if (this.tache.typeTache==TYPE_TACHE_CHANGEMENT_POINTS){
        return true;
    }
    return false;
  }

  ouvrirFicheMembre(){
    window.open("./#/membres?memberId=" +this.tache.membre.id);
  }

  validerDemande(){
     if (this.isNouveauMembre()){
      let validationNouveauMembreDialogRef = this.dialog.open(ValidationNouveauMembreDialog, {
          data: { tache:this.tache }, panelClass: "validationNouveauMembreDialog", disableClose:true
      });
     }else if (this.tache.typeTache==TYPE_TACHE_DESACTIVATION_MEMBRE){

          this.tacheService.traitementTache(this.tache, null, null, true, null).subscribe(tacheSaved => {
              if (tacheSaved){
                this.tache.dateTraitement = tacheSaved.dateTraitement;
                this.tache.agentTraitant = tacheSaved.agentTraitant;
                this.tache.validationTraitement = tacheSaved.validationTraitement;
                this.tache.refusTraitement = tacheSaved.refusTraitement;
                this.tache.commentairesRefus = tacheSaved.commentairesRefus;
              }
            });

     }else if (this.tache.typeTache==TYPE_TACHE_REACTIVATION_MEMBRE){
        // Pouvoir preciser points corpo
      let validationPointsMembreDialogRef = this.dialog.open(ValidationPointsCorpoMembreDialog, {
          data: { tache:this.tache }, panelClass: "validationPointsMembreDialog", disableClose:true
      });
     }else if (this.tache.typeTache==TYPE_TACHE_CHANGEMENT_POINTS){
        let validationPointsMembreDialogRef = this.dialog.open(ValidationPointsCorpoMembreDialog, {
            data: { tache:this.tache }, panelClass: "validationPointsMembreDialog", disableClose:true
        });
     }
  }

  refuserDemande(){
      let refusDialogRef = this.dialog.open(RefusDialog, {
          data: { tache:this.tache }, panelClass: "refusDialog", disableClose:true
      });
  }

  archive(){
    if (this.tache.markAsRead){
      this.tacheService.archive(this.tache).subscribe(result => {
        if (result){
          this.tache.archived=true;
        }
      });
    }
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
          this.numeroAft = this.tache.numeroAft;
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
      this.alerte = "Veuillez préciser un numéro AFT et un classement Corpo";
    }

  }

}

@Component({
    selector: 'validation-points-membre-dialog',
    templateUrl: './validationPointsMembre.html'
})
export class ValidationPointsCorpoMembreDialog implements OnInit {

    private tache:Tache;

    echellesCorpo:any[]=[];

    pointsCorpo:number;

    constructor(
        private tacheService:TacheService,
        private membreService:MembreService,
        private classementMembreService: ClassementMembreService,
        public dialogRef: MatDialogRef<ValidationNouveauMembreDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.tache = data.tache;
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
    if (this.pointsCorpo!=null){

          this.tacheService.traitementTache(this.tache, null, this.pointsCorpo, true, null).subscribe(tacheSaved => {
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

