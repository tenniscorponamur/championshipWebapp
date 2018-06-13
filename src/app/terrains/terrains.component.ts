import { Component, OnInit, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, Sort} from '@angular/material';
import { RxResponsiveService } from 'rx-responsive';
import {Terrain} from '../terrain';
import {TerrainService} from '../terrain.service';
import {TerrainDialog} from '../terrain-detail/terrain-detail.component';
import {compare} from '../utility';

@Component({
  selector: 'app-terrains',
  templateUrl: './terrains.component.html',
  styleUrls: ['./terrains.component.css']
})
export class TerrainsComponent implements OnInit {

  actualSort:Sort;
  sortedTerrains:Terrain[];
  selectedTerrain:Terrain;

  constructor(public media: RxResponsiveService,
                  private terrainService:TerrainService,
                  public dialog: MatDialog) { }

  ngOnInit() {
      this.terrainService.getTerrains().subscribe(terrains => {this.sortedTerrains = terrains; this.sortData(this.actualSort);});
  }


  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedTerrains.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedTerrains = data;
          return;
        }

        this.sortedTerrains = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'nom': return compare(a.nom, b.nom, isAsc);
            default: return 0;
          }
        });

    }
  }

    nouveauTerrain(){
        let nouveauTerrain: Terrain = new Terrain();

        let terrainDialogRef = this.dialog.open(TerrainDialog, {
            data: { terrain: nouveauTerrain }, panelClass: "terrainDialog"
        });

        terrainDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedTerrain = result;
                this.sortedTerrains.push(this.selectedTerrain);
                this.sortData(this.actualSort);
            }
        });
    }

    ouvrirTerrain(terrain:Terrain):void{
      let scrollPosition = "end";
        if (!this.selectedTerrain){
        scrollPosition = "start";
      }
      this.selectedTerrain=terrain;
    }

}
