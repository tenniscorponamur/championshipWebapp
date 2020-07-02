import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Championnat} from '../championnat';
import {Equipe} from '../equipe';

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

  constructor() { }

  ngOnInit() {
  }

  refreshDeletable(){
    // Faire le test sur base de l'etat du championnat
    this.deletable = !this.selectedChampionnat.calendrierValide;
  }

  selectCapitaine(){
    //TODO : selection du capitaine
  }

  selectTerrain(){
    //TODO : selection du terrain a domicile
  }

  supprimerEquipe(){
      if (this.deletable){
        this.deleteEquipe.emit(this._equipe);
      }
  }

}
