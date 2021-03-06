import { Component, OnInit} from '@angular/core';
import {MembreService} from '../membre.service';
import { saveAs } from 'file-saver';
import {Rencontre} from '../rencontre';
import {Tache, getTypeTacheAsString, TYPE_TACHE_NOUVEAU_MEMBRE, TYPE_TACHE_DESACTIVATION_MEMBRE, TYPE_TACHE_REACTIVATION_MEMBRE, TYPE_TACHE_CHANGEMENT_POINTS} from '../tache';
import {AlertesService} from '../alertes.service';
import {RencontreService} from '../rencontre.service';
import {TacheService} from '../tache.service';
import {AuthenticationService} from '../authentication.service';
import {getCategorieChampionnatCode, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {compare,addLeadingZero} from '../utility';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    lastResults:Rencontre[]=[];
    nextMeetings:Rencontre[]=[];
    preparationTemplateMembre:boolean=false;
    preparationListeForce:boolean=false;
    preparationListeForcePoints:boolean=false;
    chargementDerniersResultats:boolean=true;
    chargementProchainesRencontres:boolean=true;

  constructor(
    private authenticationService: AuthenticationService,
    private alertesService:AlertesService,
    private rencontreService:RencontreService,
    private tacheService:TacheService,
    private membreService: MembreService) { }
  
    ngOnInit(): void {
        this.rencontreService.getLastResults(5).subscribe(lastResults => {
            this.chargementDerniersResultats = false;
            this.lastResults = lastResults;
        });
        this.rencontreService.getNextMeetings(5).subscribe(nextMeetings => {
            this.chargementProchainesRencontres = false;
            this.nextMeetings = nextMeetings;
        });

        this.alertesService.refresh();
    }

    isResponsableClubConnected(){
        return this.authenticationService.isResponsableClubUserConnected();
    }

    get countRencontresToComplete(){
      return this.alertesService.getRencontresACompleter().length;
    }

    get countRencontresToValidate(){
      return this.alertesService.getRencontresAValider().length;
    }

    get taches(){

      // Trier les demandes en commençant par les demandes traitees et par date decroissante
      // Retirer les taches traitees marquees comme lues

      return this.alertesService.getTaches().filter(tache => !tache.markAsRead).sort((a,b) => {
        if (a.validationTraitement || a.refusTraitement){
          if (b.validationTraitement || b.refusTraitement){
            return compare(new Date(a.dateTraitement), new Date(b.dateTraitement), false);
          }else{
            return -1;
          }
        }else{
          if (b.validationTraitement || b.refusTraitement){
            return 1;
          }else{
            return compare(new Date(a.dateDemande), new Date(b.dateDemande), false);
          }
        }
      });
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

  getCategorieCode(rencontre:Rencontre):string{
      return getCategorieChampionnatCode(rencontre.division.championnat) + rencontre.division.pointsMaximum;
  }

  showMan(rencontre:Rencontre){
    return  rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_MESSIEURS.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code;
  }

  showWoman(rencontre:Rencontre){
    return  rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DAMES.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code;
  }

  getTemplateMembre(){
      this.preparationTemplateMembre = true;
      this.membreService.getTemplateImportMembres().subscribe(result => {
        this.preparationTemplateMembre = false;
        saveAs(result, "template.xls");
        //var fileURL = URL.createObjectURL(result);window.open(fileURL);
      },error => {console.log(error);});
  }

  getListeForces(){
      this.preparationListeForce = true;
      this.membreService.getListeForce().subscribe(result => {
          this.preparationListeForce = false;
          saveAs(result, "listeForces.pdf");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

  getListeForcesPoints(){
      this.preparationListeForcePoints = true;
      this.membreService.getListeForcePoints().subscribe(result => {
          this.preparationListeForcePoints = false;
          saveAs(result, "listeForces.pdf");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

  markAsRead(tache:Tache){
    if (tache.validationTraitement || tache.refusTraitement){
      this.tacheService.markAsRead(tache).subscribe(result => {
        if (result){
          tache.markAsRead=true;
        }
      });
    }
  }

}
