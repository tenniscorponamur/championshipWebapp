import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import {Club} from '../club';
import {Terrain} from '../terrain';
import { saveAs } from 'file-saver';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';
import {MembreService} from '../membre.service';
import {TerrainService} from '../terrain.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit {

  preparationExport:boolean=false;
  preparationExportMembres:boolean=false;

  @Output() deleteClub = new EventEmitter<Club>();

  deletable=false;

  private _club: Club;

  @Input()
  set club(club: Club) {
    this._club = club;
    this.refreshDeletable();
  }

  get club(): Club { return this._club; }

  constructor(
    public dialog: MatDialog,
    private clubService: ClubService,
    private membreService: MembreService
    ) { }

  ngOnInit() {
  }

  refreshDeletable(){
    this.clubService.isClubDeletable(this.club).subscribe(result => this.deletable = result);
  }

  ouvrirClub() {
    let clubDialogRef = this.dialog.open(ClubDialog, {
      data: { club: this.club }, panelClass: "infosGeneralesMembreDialog"
    });

    clubDialogRef.afterClosed().subscribe(result => {
    });
  }

    ouvrirTerrainClub() {
        let clubTerrainDialogRef = this.dialog.open(ClubTerrainDialog, {
          data: { club: this.club}, panelClass: "clubTerrainDialog", disableClose:true
        });

        clubTerrainDialogRef.afterClosed().subscribe();
    }

    ouvrirInfosFacturation(){
        let infosFacturationDialogRef = this.dialog.open(InfosFacturationDialog, {
          data: { club: this.club}, panelClass: "infosFacturationDialog", disableClose:true
        });

        infosFacturationDialogRef.afterClosed().subscribe();
    }

    supprimerClub(){
        if (this.deletable){
          this.deleteClub.emit(this._club);
        }
    }

  exportInformations(){
      this.preparationExport = true;
      this.clubService.exportClubInformations(this.club).subscribe(result => {
          this.preparationExport = false;
          saveAs(result, "club_" + this.club.nom + ".xls");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

  exportMembres(){
      this.preparationExportMembres = true;
      this.membreService.getExportMembresByClub(this.club).subscribe(result => {
          this.preparationExportMembres = false;
          saveAs(result, "membres_club_" + this.club.nom + ".xlsx");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

}


@Component({
  selector: 'club-dialog',
  templateUrl: './clubDialog.html',
})
export class ClubDialog {

    _numero:string;
    _nom:string;
    _description:string;
    _dateCreation:Date;
    _actif:boolean;

    showAlert:boolean=false;

    private _club:Club;

  constructor(
    public dialogRef: MatDialogRef<ClubDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clubService: ClubService) {

        this._club = data.club;
        this._numero = this._club.numero;
        this._nom = this._club.nom;
        this._description = this._club.description;
        this._actif = this._club.actif;
        if (this._club.dateCreation){
          this._dateCreation = new Date(this._club.dateCreation);
        }

    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

       // Verification du numero
      if (this._numero && this._numero.trim().length > 0){
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

      if (!this.showAlert){

        this._club.numero=this._numero;
        this._club.nom=this._nom;
        this._club.description=this._description;
        this._club.actif=this._actif;

        if (this._dateCreation!=null){
          this._club.dateCreation = new Date(this._dateCreation);
        }else{
          this._club.dateCreation = null;
        }
        if (this._club.dateCreation!=null){
          this._club.dateCreation.setHours(12);
        }

        if (!this._club.id){
            // Ajout d'un nouveau club
            this.clubService.ajoutClub(this._club).subscribe(
                newClub => {
                    this._club.id=newClub.id;
                    this.dialogRef.close(this._club);
             });
        }else{
            //Mise a jour du club
            this.clubService.updateClub(this._club).subscribe(
                result => {
                    this.dialogRef.close(this._club);
             });
        }

      }

  }
}

@Component({
  selector: 'club-terrain-dialog',
  templateUrl: './clubTerrainDialog.html',
})
export class ClubTerrainDialog {

  terrains:Terrain[];

    _terrainId:number;
    private _club:Club;

  constructor(
    public dialogRef: MatDialogRef<ClubTerrainDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clubService: ClubService,
    private terrainService:TerrainService
    ) {

      this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains);

        this._club = data.club;
        if (this._club.terrain){
          this._terrainId = this._club.terrain.id;
        }
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      if (this._club.id){
          if (this._terrainId){
            this.terrainService.getTerrain(this._terrainId).subscribe(terrain => {
                this._club.terrain=terrain;
                this.updateTerrainClubAndCloseDialog();
            });
          }else{
              this._club.terrain=null;
              this.updateTerrainClubAndCloseDialog();
          }
      }
  }

  updateTerrainClubAndCloseDialog(){
    //Mise a jour du terrain du club
    this.clubService.updateClub(this._club).subscribe(
        result => {
            this.dialogRef.close(this._club);
     });
  }
}

@Component({
  selector: 'informations-facturation-dialog',
  templateUrl: './infosFacturationDialog.html',
})
export class InfosFacturationDialog {

    _numeroTVA:string;
    _adresse:string;

    private _club:Club;

  constructor(
    public dialogRef: MatDialogRef<InfosFacturationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clubService: ClubService) {

        this._club = data.club;
        this._numeroTVA = this._club.numeroTVA;
        this._adresse = this._club.adresse;

    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      this._club.numeroTVA=this._numeroTVA;
      this._club.adresse=this._adresse;

      this.clubService.updateClub(this._club).subscribe(
          result => {
              this.dialogRef.close(this._club);
       });
  }
}
