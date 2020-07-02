import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {compare} from '../utility';
import {Equipe} from '../equipe';
import {Membre} from '../membre';
import {Terrain} from '../terrain';
import {EquipeService} from '../equipe.service';
import {TerrainService} from '../terrain.service';

@Component({
  selector: 'app-select-terrain-dialog',
  templateUrl: './select-terrain-dialog.component.html',
  styleUrls: ['./select-terrain-dialog.component.css']
})
export class SelectTerrainDialogComponent {

  terrains:Terrain[];

    _terrainId:number;
    private _equipe:Equipe;

  constructor(
    public dialogRef: MatDialogRef<SelectTerrainDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private equipeService: EquipeService,
    private terrainService:TerrainService
    ) {

      this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains.sort((a,b) => compare(a.nom,b.nom,true)));

        this._equipe = data.equipe;
        if (this._equipe.terrain){
          this._terrainId = this._equipe.terrain.id;
        }
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      if (this._equipe.id){
          if (this._terrainId){
            this.terrainService.getTerrain(this._terrainId).subscribe(terrain => {
                this._equipe.terrain=terrain;
                this.updateTerrainEquipeAndCloseDialog();
            });
          }else{
              this._equipe.terrain=null;
              this.updateTerrainEquipeAndCloseDialog();
          }
      }
  }

  updateTerrainEquipeAndCloseDialog(){
    //Mise a jour du terrain de l'equipe
      this.equipeService.updateEquipe(this._equipe.division.id,this._equipe).subscribe(
        result => {
            this.dialogRef.close(this._equipe);
     });
  }
}

