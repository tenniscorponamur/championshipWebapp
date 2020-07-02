import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Championnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {compare} from '../utility';
import {Equipe} from '../equipe';
import {Membre} from '../membre';
import {Terrain} from '../terrain';
import {EquipeService} from '../equipe.service';
import {TerrainService} from '../terrain.service';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';

@Component({
  selector: 'app-equipe-detail',
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.css']
})
export class EquipeDetailComponent implements OnInit {

  @Output() deleteEquipe = new EventEmitter<Equipe>();

  deletable=false;

  private _equipe: Equipe;
  selectedChampionnat:Championnat;

  @Input()
  set equipe(equipe: Equipe) {
    this._equipe = equipe;
    this.selectedChampionnat = this._equipe.division.championnat;
    this.refreshDeletable();
  }

  get equipe(): Equipe { return this._equipe; }

  constructor(
        public dialog: MatDialog,
        private equipeService: EquipeService
  ) { }

  ngOnInit() {
  }

  refreshDeletable(){
    // Faire le test sur base de l'etat du championnat
    this.deletable = !this.selectedChampionnat.calendrierValide;
  }

  selectCapitaine(){

      if (!this.selectedChampionnat.cloture){

        let genre:string = this.getGenreChampionnat();

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: this.equipe.club, capitaine: true, genre:genre, deselectionPossible:(this.equipe.capitaine!=null)}, panelClass: "membreSelectionDialog", disableClose: false
        });

        membreSelectionRef.afterClosed().subscribe(membre => {
              this.equipe.capitaine=membre;
              this.equipeService.updateEquipe(this.equipe.division.id,this.equipe).subscribe();
        });
      }
  }

  selectTerrain(){
      if (!this.selectedChampionnat.cloture){
        let equipeTerrainDialogRef = this.dialog.open(SelectTerrainDialog, {
          data: { equipe: this.equipe}, panelClass: "selectTerrainDialog", disableClose:true
        });

        equipeTerrainDialogRef.afterClosed().subscribe();
      }
    }
  supprimerEquipe(){
      if (this.deletable){
        this.deleteEquipe.emit(this._equipe);
      }
  }

    getGenreChampionnat():string{
        let genre:string;
        if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_MESSIEURS.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code){
          genre = GENRE_HOMME.code;
        } else if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_DAMES.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code){
          genre = GENRE_FEMME.code;
        } else if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_MIXTES.code){
        }
        return genre;
    }

}


@Component({
  selector: 'select-terrain-dialog',
  templateUrl: './select-terrain-dialog.html',
})
export class SelectTerrainDialog {

  terrains:Terrain[];

    _terrainId:number;
    private _equipe:Equipe;

  constructor(
    public dialogRef: MatDialogRef<SelectTerrainDialog>,
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

