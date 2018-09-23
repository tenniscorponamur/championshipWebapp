import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import {Terrain} from '../terrain';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {TerrainService} from '../terrain.service';

@Component({
  selector: 'app-terrain-detail',
  templateUrl: './terrain-detail.component.html',
  styleUrls: ['./terrain-detail.component.css']
})
export class TerrainDetailComponent implements OnInit {

  @Output() deleteTerrain = new EventEmitter<Terrain>();

  deletable=false;

  private _terrain: Terrain;

  @Input()
  set terrain(terrain: Terrain) {
    this._terrain = terrain;
    this.refreshDeletable();
  }

  get terrain(): Terrain { return this._terrain; }

  constructor(
    public dialog: MatDialog,
    private terrainService: TerrainService
    ) { }

  ngOnInit() {
  }

  refreshDeletable(){
    this.terrainService.isTerrainDeletable(this.terrain).subscribe(result => this.deletable = result);
  }

  ouvrirTerrain() {
    let terrainDialogRef = this.dialog.open(TerrainDialog, {
      data: { terrain: this.terrain }, panelClass: "terrainDialog", disableClose:true
    });

    terrainDialogRef.afterClosed().subscribe(result => {
    });
  }
  
  ouvrirHorairesTerrain(){
      //TODO : ouvrir horaires
  }

  supprimerTerrain(){
      if (this.deletable){
        this.deleteTerrain.emit(this._terrain);
      }
  }

}


@Component({
  selector: 'terrain-dialog',
  templateUrl: './terrainDialog.html',
})
export class TerrainDialog {

    _nom:string;
    _description:string;
    _adresse:string;
    _actif:boolean;

    showAlert:boolean=false;

    private _terrain:Terrain;

  constructor(
    public dialogRef: MatDialogRef<TerrainDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private terrainService: TerrainService) {

        this._terrain = data.terrain;
        this._nom = this._terrain.nom;
        this._description = this._terrain.description;
        this._adresse = this._terrain.adresse;
        this._actif = this._terrain.actif;

    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

    // Verification du nom
      if (this._nom && this._nom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

      if (!this.showAlert){

        this._terrain.nom=this._nom;
        this._terrain.description=this._description;
        this._terrain.adresse=this._adresse;
        this._terrain.actif=this._actif;

        if (!this._terrain.id){
            // Ajout d'un nouveau terrain
            this.terrainService.ajoutTerrain(this._terrain).subscribe(
                newTerrain => {
                    this._terrain.id=newTerrain.id;
                    this.dialogRef.close(this._terrain);
             });
        }else{
            //Mise a jour du terrain
            this.terrainService.updateTerrain(this._terrain).subscribe(
                result => {
                    this.dialogRef.close(this._terrain);
             });
        }

      }

  }
}
