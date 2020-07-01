import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

  @Input()
  set equipe(equipe: Equipe) {
    this._equipe = equipe;
    this.refreshDeletable();
  }

  get equipe(): Equipe { return this._equipe; }

  constructor() { }

  ngOnInit() {
  }

  refreshDeletable(){
    //TODO : faire le test sur base de l'etat du championnat
    this.deletable = true;
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
