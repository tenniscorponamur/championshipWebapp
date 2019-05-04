import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import {Club} from '../club';
import {Terrain} from '../terrain';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';
import {TerrainService} from '../terrain.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit {

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
    private clubService: ClubService
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

    supprimerClub(){
        if (this.deletable){
          this.deleteClub.emit(this._club);
        }
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

        if (!this._club.id){
            // Ajout d'un nouveal utilisateur
            this.clubService.ajoutClub(this._club).subscribe(
                newClub => {
                    this._club.id=newClub.id;
                    this.dialogRef.close(this._club);
             });
        }else{
            //Mise a jour de l'utilisateur
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
