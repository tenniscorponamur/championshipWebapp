import { Component, Inject, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import { Membre } from '../membre';

import { Router,ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {MembreService} from '../membre.service';

@Component({
  selector: 'app-membre-detail',
  templateUrl: './membre-detail.component.html',
  styleUrls: ['./membre-detail.component.css']
})
export class MembreDetailComponent implements OnInit {

  @Input('master') masterName: string;
  @Output() childResult = new EventEmitter<string>();

  userImageClass:string = "fa fa-user fa-5x undefinedMember";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private membreService: MembreService,
    private location: Location,
    public dialog: MatDialog
    ) { }

  ngOnInit() {
    //this.getMembre();
  }

  private _membre: Membre;

  @Input()
  set membre(membre: Membre) {
    this._membre = membre;
    this.refreshUserImage();
  }

  get membre(): Membre { return this._membre; }

  refreshUserImage(){
    if (this._membre) {
        if (this._membre.genre == GENRE_HOMME.code){
          this.userImageClass = "fa fa-user fa-5x maleMember";
      }else{
          this.userImageClass = "fa fa-user fa-5x femaleMember";
      }
    }
  }

  ouvrirInfosGenerales() {
    let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
      data: { membre: this.membre }, panelClass: "infosGeneralesMembreDialog"
    });

    membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
      console.log('Les informations generales ont ete modifiees a ete ferme : ' + result);
      this.refreshUserImage();
    });
  }

  ouvrirHistoriqueClassement(): void {
    let historiqueClassementDialogRef = this.dialog.open(HistoriqueClassementDialog, {
      data: { membre: this.membre }, panelClass: "historiqueClassementDialog", disableClose:false
    });

    historiqueClassementDialogRef.afterClosed().subscribe(result => {
      console.log('Le classement a ete ferme');
    });
  }

  getMembre(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.membreService.getMembre(id)
      .subscribe(membre => this.membre = membre);
  }

  goBack():void{
//    this.router.navigate(['/membres',{filtreNomPrenom:'ceci est un test'}]);
//      this.location.back();
  }

  save():void{
    this.childResult.emit('saveChild');
    // TODO : vider le formulaire : membre = null;
//     this.goBack();
  }

}


@Component({
  selector: 'historique-classement-dialog',
  templateUrl: './historiqueClassementDialog.html',
})
export class HistoriqueClassementDialog {

  constructor(
    public dialogRef: MatDialogRef<HistoriqueClassementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'infos-generales-membre-dialog',
  templateUrl: './infosGeneralesMembreDialog.html',
})
export class InfosGeneralesMembreDialog {

    genres = GENRES;

    _genre:string;
    _prenom:string;
    _nom:string;
    _dateNaissance:Date;

    showAlert:boolean=false;

    private _membre:Membre;

  constructor(
    public dialogRef: MatDialogRef<InfosGeneralesMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService) {
        this._membre = data.membre;
        this._prenom = this._membre.prenom;
        this._nom = this._membre.nom;
        this._genre = this._membre.genre;
        this._dateNaissance = this._membre.dateNaissance;

//        const [day, month, year]: string[] = "02/11/1982".split('/');
//        this._dateNaissance = new Date();
//        this._dateNaissance.setFullYear(+year,+month-1,+day);
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

      // Verification du genre
      if (this._genre){
          //this.showAlert=false;
      }else{
          this.showAlert=true;
      }
      
       // Verification du prenom
      if (this._prenom && this._prenom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }
      
    // Verification du nom 
      if (this._nom && this._nom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

//      // Verification de la date de naissance
//      if (this._dateNaissance){
//          //this.showAlert=false;
//      }else{
//          this.showAlert=true;
//      }
      
      if (!this.showAlert){
          
        this._membre.prenom=this._prenom;
        this._membre.nom=this._nom;
        this._membre.genre=this._genre;
          this._membre.dateNaissance = this._dateNaissance;
        
        if (!this._membre.id){
            // Ajout d'un nouveal utilisateur
            this.membreService.ajoutMembre(this._membre).subscribe(
                result => {
                    this.dialogRef.close(this._membre);
             });
        }else{
            //Mise a jour de l'utilisateur
            this.membreService.updateMembre(this._membre).subscribe(
                result => {
                    this.dialogRef.close(this._membre);
             });
        }
        
      }

  }
}
