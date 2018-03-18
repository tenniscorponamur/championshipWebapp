import { Component, Inject, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

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
      if (this._membre) { 
          if (this._membre.prenom=='Fabrice'){
          this.userImageClass = "fa fa-user fa-5x maleMember";
        }else{
            this.userImageClass = "fa fa-user fa-5x femaleMember";
        }
      }
  }
  
  get membre(): Membre { return this._membre; }
    
  ouvrirInfosGenerales() {
    let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
      data: { membre: this.membre }, panelClass: "historiqueClassementDialog"
    });

    membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
      console.log('Les informations generales ont ete modifiees a ete ferme : ' + result);
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
    
    prenom:string;
    nom:string;
    
    private _membre:Membre;
    
  constructor(
    public dialogRef: MatDialogRef<InfosGeneralesMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
        this._membre = data.membre;
        this.prenom = this._membre.prenom;
        this.nom = this._membre.nom;
    }

  cancel(): void {
    this.dialogRef.close();
  }
  
  save(): void {
      this._membre.prenom=this.prenom;
      this._membre.nom=this.nom;
    this.dialogRef.close(this._membre);
  }
}
