import { Component, OnInit } from '@angular/core';
import {TacheService} from '../tache.service';
import {Tache, getTypeTacheAsString} from '../tache';
import {compare} from '../utility';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.css']
})
export class DemandesComponent implements OnInit {

  taches:Tache[]=[];
  filteredTaches:Tache[]=[];

  _concerne:string;

  selectedTask:Tache;

  constructor(
    private tacheService:TacheService
    ) {
  }

  ngOnInit() {
    this.tacheService.getAllTaches().subscribe(taches => {
      this.taches = taches.sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),false));
      this.filtre();
    });
  }

  getTypeTache(tache:Tache){
    return getTypeTacheAsString(tache);
  }

  filtre(): void {

        this.filteredTaches = this.taches;

        if (this._concerne && this._concerne.trim().length > 0){

            this.filteredTaches = this.filteredTaches.filter(tache =>
                tache.membre.nom.toLowerCase().includes(this._concerne.toLowerCase())
             || tache.membre.prenom.toLowerCase().includes(this._concerne.toLowerCase()));

        }

  }

  ouvrirTache(tache:Tache){
    alert("ouvrir tache");
    this.selectedTask = tache;
  }

}
