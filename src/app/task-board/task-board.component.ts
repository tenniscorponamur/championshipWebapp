import { Component, OnInit } from '@angular/core';
import {TacheService} from '../tache.service';
import {Tache, getTypeTacheAsString, TYPE_TACHE_NOUVEAU_MEMBRE, TYPE_TACHE_DESACTIVATION_MEMBRE, TYPE_TACHE_REACTIVATION_MEMBRE, TYPE_TACHE_CHANGEMENT_POINTS} from '../tache';
import {compare} from '../utility';
import {AuthenticationService} from '../authentication.service';

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent implements OnInit {

  taches:Tache[]=[];
  filteredTaches:Tache[]=[];

  _demandeur:string;
  _concerne:string;
  withArchives:boolean=false;

  selectedTask:Tache;

  constructor(
    private authenticationService: AuthenticationService,
    private tacheService:TacheService
  ) { }

  ngOnInit() {
    this.refreshTasks();
  }

  refreshTasks(){
    this.tacheService.getTaches(this.withArchives).subscribe(taches => {
      this.taches = taches;
      this.filtre();
    });
  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  get tachesOuvertes(){
    return this.filteredTaches.filter(tache => !tache.validationTraitement && !tache.refusTraitement).sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),true));
  }

  get tachesTraitees(){
    return this.filteredTaches.filter(tache => tache.validationTraitement || tache.refusTraitement).sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),false));
  }

  getTypeTache(tache:Tache){
    return getTypeTacheAsString(tache);
  }

  showMembreLink(tache:Tache){
    if (tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE){
      if (tache.validationTraitement==true){
        return true;
      }
    }
    if (tache.typeTache==TYPE_TACHE_DESACTIVATION_MEMBRE){
      if (!tache.validationTraitement){
        return true;
      }
    }
    if (tache.typeTache==TYPE_TACHE_REACTIVATION_MEMBRE){
      if (tache.validationTraitement){
        return true;
      }
    }
    if (tache.typeTache==TYPE_TACHE_CHANGEMENT_POINTS){
        return true;
    }
    return false;
  }

  ouvrirFicheMembre(tache:Tache){
    window.open("./#/membres?memberId=" +tache.membre.id);
  }


  filtre(): void {

        this.filteredTaches = this.taches;

        if (this._demandeur && this._demandeur.trim().length > 0){

            this.filteredTaches = this.filteredTaches.filter(tache =>
                tache.demandeur.nom.toLowerCase().includes(this._demandeur.toLowerCase())
             || tache.demandeur.prenom.toLowerCase().includes(this._demandeur.toLowerCase()));

        }

        if (this._concerne && this._concerne.trim().length > 0){

            this.filteredTaches = this.filteredTaches.filter(tache =>
                tache.membre.nom.toLowerCase().includes(this._concerne.toLowerCase())
             || tache.membre.prenom.toLowerCase().includes(this._concerne.toLowerCase()));

        }

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
