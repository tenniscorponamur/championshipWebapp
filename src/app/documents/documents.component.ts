import { Component, OnInit } from '@angular/core';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare, formatDateInString} from '../utility';
import {Championnat, TYPE_CHAMPIONNAT_CRITERIUM, TYPE_CHAMPIONNAT_ETE} from '../championnat';
import {ChampionnatService} from '../championnat.service';
import {RencontreService} from '../rencontre.service';
import {MembreService} from '../membre.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent extends ChampionnatDetailComponent implements OnInit {

   championnats: Championnat[];
  selectedChampionnat: Championnat;
  date:Date;

    preparationListeCapitaines:boolean=false;
    preparationTableauCriterium:boolean=false;
    preparationCalendrierPdf:boolean=false;
    preparationCalendrierExcel:boolean=false;
    preparationExportMembres:boolean=false;

  constructor(
        private championnatService: ChampionnatService,
        private membreService: MembreService,
        private rencontreService: RencontreService
        ) {
      super();
  }

  ngOnInit() {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort(
                (a, b) => {
                    let comparaisonAnnee = compare(a.annee, b.annee, false);
                    if (comparaisonAnnee != 0) {
                        return comparaisonAnnee;
                    } else {
                        let comparaisonType = compare(a.type, b.type, true);
                        if (comparaisonType != 0) {
                            return comparaisonType;
                        } else {
                            return compare(a.categorie, b.categorie, true);
                        }
                    }
                });
          });
  }

  getListeCapitaine(){
    if (this.selectedChampionnat){
      this.preparationListeCapitaines=true;
      this.championnatService.getListeCapitaines(this.selectedChampionnat).subscribe(result => {
          this.preparationListeCapitaines = false;
          saveAs(result, "capitaines.pdf");
      },error => {console.log(error);});
    }
  }
  
  getTableauCriterium(){
    if (this.date){
      this.preparationTableauCriterium=true;
      this.date = new Date(this.date);
      this.date.setHours(12);
      this.championnatService.getTableauCriterium(this.date).subscribe(result => {
          this.preparationTableauCriterium = false;
          saveAs(result, "tableauCriterium_" + formatDateInString(this.date) + ".pdf");
      },error => {console.log(error);});
    }
  }
  
  /*
          this.startDate = new Date(this.startDate);
          this.startDate.setHours(12);
          */

  getCalendrierPdf(){
    if (this.selectedChampionnat){
      this.preparationCalendrierPdf=true;
      this.rencontreService.getCalendrier(this.selectedChampionnat.id,false).subscribe(result => {
          this.preparationCalendrierPdf = false;
          saveAs(result, "calendrier.pdf");
      },error => {console.log(error);});
    }
  }

  getCalendrierExcel(){
    if (this.selectedChampionnat){
      this.preparationCalendrierExcel=true;
      this.rencontreService.getCalendrier(this.selectedChampionnat.id,true).subscribe(result => {
          this.preparationCalendrierExcel = false;
          saveAs(result, "calendrier.xlsx");
      },error => {console.log(error);});
    }
  }

  getExportMembres(){
    this.preparationExportMembres=true;
    this.membreService.getExportMembres().subscribe(result => {
        this.preparationExportMembres = false;
        saveAs(result, "exportMembres.xlsx");
    },error => {console.log(error);});
  }

}
