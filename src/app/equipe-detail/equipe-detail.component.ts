import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Championnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {compare} from '../utility';
import {Equipe, EquipeExtended} from '../equipe';
import {Membre} from '../membre';
import {Terrain} from '../terrain';
import {EquipeService} from '../equipe.service';
import {TerrainService} from '../terrain.service';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {SelectTerrainDialogComponent} from '../select-terrain-dialog/select-terrain-dialog.component';
import { CompositionEquipeDialogComponent } from '../composition-equipe-dialog/composition-equipe-dialog.component';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';

@Component({
  selector: 'app-equipe-detail',
  templateUrl: './equipe-detail.component.html',
  styleUrls: ['./equipe-detail.component.css']
})
export class EquipeDetailComponent implements OnInit {

  @Output() deleteEquipe = new EventEmitter<Equipe>();

  deletable=false;

  selectedChampionnat:Championnat;

  private _equipe: Equipe;
  equipeExtended:EquipeExtended;


  @Input()
  set equipe(equipe: Equipe) {
    this._equipe = equipe;
    this.selectedChampionnat = this._equipe.division.championnat;
    this.refreshDeletable();
    this.refreshComposition();
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

  refreshComposition(){
    this.equipeExtended = new EquipeExtended();
    this.equipeExtended.equipe = this.equipe;
    this.equipeService.getMembresEquipe(this.equipeExtended.equipe).subscribe(membres => {
      membres.forEach(membre => this.equipeExtended.membresEquipe.push(membre));
    });
  }

  selectCapitaine(){

      if (!this.selectedChampionnat.cloture){

        let genre:string = this.getGenreChampionnat();

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: this.equipe.club, capitaine: true, genre:genre, deselectionPossible:(this.equipe.capitaine!=null)}, panelClass: "membreSelectionDialog", disableClose: false
        });

        membreSelectionRef.afterClosed().subscribe(membre => {
              if (membre!== undefined){
                this.equipe.capitaine=membre;
                this.equipeService.updateEquipe(this.equipe.division.id,this.equipe).subscribe();
              }
        });
      }
  }

  selectTerrain(){
      if (!this.selectedChampionnat.cloture){
        let selectTerrainDialogRef = this.dialog.open(SelectTerrainDialogComponent, {
          data: { equipe: this.equipe}, panelClass: "selectTerrainDialog", disableClose:true
        });

        selectTerrainDialogRef.afterClosed().subscribe();
      }
    }

    ouvrirCompositionEquipe(){
      if (!this.selectedChampionnat.cloture){
        let genre:string = this.getGenreChampionnat();
        let compoEquipeRef = this.dialog.open(CompositionEquipeDialogComponent, {
            data: {equipeExtended: this.equipeExtended, genre:genre}, panelClass: "compositionEquipeDialog", disableClose: false
        });
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
