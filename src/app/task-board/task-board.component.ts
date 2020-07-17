import { Component, OnInit } from '@angular/core';
import {TacheService} from '../tache.service';
import {Tache, getTypeTacheAsString} from '../tache';
import {compare} from '../utility';

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent implements OnInit {

  taches:Tache[]=[];
  selectedTask:Tache;

  constructor(
    private tacheService:TacheService
  ) { }

  ngOnInit() {
    this.tacheService.getAllTaches().subscribe(taches => {
      this.taches = taches;
    });
  }

  get tachesOuvertes(){
    return this.taches.filter(tache => !tache.validationTraitement && !tache.refusTraitement).sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),true));
  }

  get tachesTraitees(){
    return this.taches.filter(tache => tache.validationTraitement || tache.refusTraitement).sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),false));
  }

  getTypeTache(tache:Tache){
    return getTypeTacheAsString(tache);
  }

  ouvrirTache(tache:Tache){
    this.selectedTask = tache;

    //TODO : archives (taches terminees) : validation/refus le DD/MM/YY à HH:MI par XXX
    //TODO : nouveau membre : tache -> membre avec caracteristique fantome (test numero AFT deja existant --> verifier membre actif ou inactif afin de rediriger vers la bonne operation)
    //TODO : desactivation membre : tache -> membre actif existant
    //TODO : reactivation membre : tache -> membre inactif existant
    //TODO : nouveau classement corpo : tache -> classementCorpo et membre actif existant
    //TODO : politique confidentialité --> pris connaissance et transmis au nouveau membre -> adhesion


    //TODO : Conserver infos demandeur : tache -> membre_demandeur
    //TODO : conserver qui a traite le dossier : tache -> admin (user)
    //TODO : permettre aux membres demandeurs de voir les dossiers traites -> utiliser un systeme lu/non-lu permettant d'afficher alertes
  }

}