import { Component, OnInit, EventEmitter, Inject, Input, Output } from '@angular/core';
import {Terrain, HoraireTerrain, JOURS_SEMAINE, JourSemaine, Court} from '../terrain';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog, Sort} from '@angular/material';
import {TerrainService} from '../terrain.service';
import {TYPES_CHAMPIONNAT, TypeChampionnat} from '../championnat';
import {compare} from '../utility';

@Component({
  selector: 'app-terrain-detail',
  templateUrl: './terrain-detail.component.html',
  styleUrls: ['./terrain-detail.component.css']
})
export class TerrainDetailComponent implements OnInit {

  @Output() deleteTerrain = new EventEmitter<Terrain>();

  joursSemaine:JourSemaine[] = JOURS_SEMAINE;
  typesChampionnat: TypeChampionnat[] = TYPES_CHAMPIONNAT;
      
  horairesTerrain:HoraireTerrain[];
  courts:Court[];
  deletable=false;

  private _terrain: Terrain;

  @Input()
  set terrain(terrain: Terrain) {
    this._terrain = terrain;
    this.refreshHoraires();
      this.refreshCourts();
    this.refreshDeletable();
  }

  get terrain(): Terrain { return this._terrain; }

  constructor(
    public dialog: MatDialog,
    private terrainService: TerrainService
    ) { }

  ngOnInit() {
      this.refreshHoraires();
  }

  sortData(sort: Sort) {
    const data = this.horairesTerrain.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.horairesTerrain = data;
          return;
        }
        
        this.horairesTerrain = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'typeChampionnat': return compare(a.typeChampionnat, b.typeChampionnat, isAsc);
            case 'jourSemaine': return compare(a.jourSemaine==1?8:a.jourSemaine, b.jourSemaine==1?8:b.jourSemaine, isAsc);
            default: return 0;
          }
        });
    }
  }
  
  refreshDeletable(){
      if (this.terrain){
        this.terrainService.isTerrainDeletable(this.terrain).subscribe(result => this.deletable = result);
      }
  }

  ouvrirTerrain() {
    let terrainDialogRef = this.dialog.open(TerrainDialog, {
      data: { terrain: this.terrain }, panelClass: "terrainDialog", disableClose:true
    });

    terrainDialogRef.afterClosed().subscribe(result => {
    });
  }
  
  refreshHoraires(){
      if (this.terrain){
          this.terrainService.getHorairesTerrain(this.terrain).subscribe(horairesTerrain => this.horairesTerrain = horairesTerrain);
      }
  }
  
  refreshCourts(){
      if (this.terrain){
          this.terrainService.getCourtsTerrain(this.terrain.id).subscribe(courts => this.courts = courts);
      }
  }
  
  addHoraire(){
    let horaireTerrain = new HoraireTerrain();
    this.horairesTerrain.push(horaireTerrain);
  }
  
  changeHoraire(horaireTerrain:HoraireTerrain){
    if (horaireTerrain.typeChampionnat != null 
        && horaireTerrain.jourSemaine != null 
        && horaireTerrain.heures != null 
        && horaireTerrain.minutes!=null){
        if (horaireTerrain.id!=null){
            this.terrainService.updateHoraireTerrain(this.terrain,horaireTerrain).subscribe();
        }else{
            this.terrainService.ajoutHoraireTerrain(this.terrain, horaireTerrain).subscribe(horaireSaved => horaireTerrain.id = horaireSaved.id);
        }
    }
  }
  
  supprimerHoraire(horaireTerrain:HoraireTerrain){
      this.terrainService.deleteHoraireTerrain(this.terrain,horaireTerrain).subscribe(result => {
        this.horairesTerrain.splice(this.horairesTerrain.indexOf(horaireTerrain), 1);
    });
  }
  
  addCourt(){
    let court = new Court();
    this.courts.push(court);
  }
  
  changeCourt(court:Court){
    if (court.id!=null){
        this.terrainService.updateCourt(this.terrain,court).subscribe();
    }else{
        this.terrainService.ajoutCourt(this.terrain, court).subscribe(courtSaved => court.id = courtSaved.id);
    }
  }
  
  supprimerCourt(court:Court){
      this.terrainService.deleteCourt(this.terrain,court).subscribe(result => {
        this.courts.splice(this.courts.indexOf(court), 1);
    });
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