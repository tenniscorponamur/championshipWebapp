import { Component, OnInit} from '@angular/core';
import {MembreService} from '../membre.service';
import { saveAs } from 'file-saver';
import {Rencontre} from '../rencontre';
import {AlertesService} from '../alertes.service';
import {RencontreService} from '../rencontre.service';
import {addLeadingZero} from '../utility';

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
    private alertesService:AlertesService,
    private rencontreService:RencontreService,
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

    get countRencontresToComplete(){
      return this.alertesService.getRencontresACompleter().length;
    }

    get countRencontresToValidate(){
      return this.alertesService.getRencontresAValider().length;
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

}
