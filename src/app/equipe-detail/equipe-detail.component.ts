import { Component, OnInit, Input, Output, EventEmitter, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Championnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {compare} from '../utility';
import {Equipe, EquipeExtended} from '../equipe';
import {Membre} from '../membre';
import {Division} from '../division';
import {Terrain} from '../terrain';
import {DivisionService} from '../division.service';
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
  @Output() updatedDivisionEquipe = new EventEmitter<Equipe>();

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

  get boxClass(): string{
    if (this.deletable){
      return "myBox myBoxEditable";
    }else{
      return "myBox";
    }
  }

  get teamImageClass(){
    let genre = this.getGenreChampionnat();
    if (genre!=null){
      if (genre == GENRE_HOMME.code){
        return "fa fa-users fa-4x maleTeam";
      }
      if (genre == GENRE_FEMME.code){
        return "fa fa-users fa-4x femaleTeam";
      }
    }
    return "fa fa-users fa-4x undefinedTeam";
  }

  refreshDeletable(){
    this.deletable = this.selectedChampionnat.autoriserResponsables && !this.selectedChampionnat.calendrierValide;
  }

  refreshComposition(){
    this.equipeExtended = new EquipeExtended();
    this.equipeExtended.equipe = this.equipe;
    this.equipeService.getMembresEquipe(this.equipeExtended.equipe).subscribe(membres => {
      membres.forEach(membre => this.equipeExtended.membresEquipe.push(membre));
    });
  }

  changeDivision(){
    if (this.deletable){

        let changeDivisionRef = this.dialog.open(SelectDivisionDialogComponent, {
            data: {equipe: this.equipe}, panelClass: "divisionSelectionDialog", disableClose: true
        });

        changeDivisionRef.afterClosed().subscribe(updatedEquipe => {
              if (updatedEquipe!== undefined){
                this.updatedDivisionEquipe.emit(updatedEquipe);
              }
        });

    }
  }

  selectCapitaine(){

      if (!this.selectedChampionnat.cloture){

        let genre:string = this.getGenreChampionnat();

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: this.equipe.club, genre:genre, deselectionPossible:(this.equipe.capitaine!=null)}, panelClass: "membreSelectionDialog", disableClose: false
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

    ouvrirCommentairesEquipe(){
      if (this.deletable){
        let commentairesEquipeDialogRef = this.dialog.open(CommentairesEquipeDialog, {
            data: {equipe: this.equipe}, panelClass: "commentairesEquipeDialog", disableClose:true
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

@Component({
  selector: 'app-select-division-dialog',
  templateUrl: './select-division-dialog.component.html'
})
export class SelectDivisionDialogComponent {

  divisions:Division[]=[];
    _division:Division;
    private _equipe:Equipe;

  constructor(
    public dialogRef: MatDialogRef<SelectDivisionDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private divisionService: DivisionService,
      private equipeService: EquipeService
    ) {

      this._equipe = data.equipe;
      this.divisionService.getDivisions(this._equipe.division.championnat.id).subscribe(divisions =>
      {
        this.divisions = divisions.sort((a,b) => compare(a.numero,b.numero,true));
        this._division = this.divisions.find(division => division.id == this._equipe.division.id);
      });

    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      this.equipeService.updateDivisionEquipe(this._equipe,this._division).subscribe(
        result => {
            this.dialogRef.close(this._equipe);
      });
  }

}

@Component({
    selector: 'commentaires-equipe-dialog',
    templateUrl: './commentairesEquipeDialog.html'
})
export class CommentairesEquipeDialog implements OnInit {

    private equipe:Equipe;
    _commentaires:string;

    constructor(
        private equipeService: EquipeService,
        public dialogRef: MatDialogRef<CommentairesEquipeDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.equipe=data.equipe;
          this._commentaires = this.equipe.commentaires;
        }

    ngOnInit() {
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        this.equipe.commentaires = this._commentaires;
        this.equipeService.updateEquipe(this.equipe.division.id,this.equipe).subscribe(result => this.dialogRef.close());
    }
}

