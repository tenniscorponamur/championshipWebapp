import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {compare, addLeadingZero} from '../utility';
import {Rencontre} from '../rencontre';
import {Terrain} from '../terrain';
import {RencontreService} from '../rencontre.service';
import {getCategorieChampionnatCode} from '../championnat';

@Component({
  selector: 'app-planification-criterium',
  templateUrl: './planification-criterium.component.html',
  styleUrls: ['./planification-criterium.component.css']
})
export class PlanificationCriteriumComponent implements OnInit {

  annee:string;
  rencontres:Rencontre[]=[];
  journees:Journee[]=[];

  constructor(
        public dialog: MatDialog,
        private rencontreService:RencontreService
      ) { }

  ngOnInit() {
    this.annee=""+new Date().getFullYear();
    this.refreshCalendrier();
  }

  getRemainingSize():number{
    return this.rencontres.filter(rencontre => !rencontre.dateHeureRencontre).length;
  }

  refreshCalendrier(){
    this.rencontreService.getRencontresCriteriumByAnnee(this.annee).subscribe(rencontres => {
      this.rencontres = rencontres;
      this.createCalendrier();
    });
  }

  createCalendrier(){
    this.journees = [];
    this.rencontres.forEach(rencontre => {
      if (rencontre.dateHeureRencontre){
        let selectedJournee = this.journees.find(journee => {
          return new Date(journee.date).getFullYear() == new Date(rencontre.dateHeureRencontre).getFullYear() &&
          new Date(journee.date).getMonth() == new Date(rencontre.dateHeureRencontre).getMonth() &&
          new Date(journee.date).getDate() == new Date(rencontre.dateHeureRencontre).getDate();
        });
        if (selectedJournee==null){
          selectedJournee = new Journee();
          selectedJournee.date = rencontre.dateHeureRencontre;
          this.journees.push(selectedJournee);
        }
        let selectedHoraire = selectedJournee.horaires.find(horaire => {
          return horaire.heures == new Date(rencontre.dateHeureRencontre).getHours() && horaire.minutes == new Date(rencontre.dateHeureRencontre).getMinutes();
        });
        if (selectedHoraire==null){
          selectedHoraire = new Horaire();
          selectedHoraire.heures = new Date(rencontre.dateHeureRencontre).getHours();
          selectedHoraire.minutes = new Date(rencontre.dateHeureRencontre).getMinutes();
          selectedJournee.horaires.push(selectedHoraire);
        }
        selectedHoraire.rencontres.push(rencontre);
      }
    });

    this.triJournees();
    this.journees.forEach(journee => this.triHoraires(journee));
  }

  triJournees(){
    this.journees.sort((a,b) => compare(a.date,b.date,true));
  }

  triHoraires(journee:Journee){
    journee.horaires.sort((a,b) => {
        let compareHeures = compare(a.heures*1,b.heures*1,true);
        if (compareHeures==0){
          return compare(a.minutes*1,b.minutes*1,true);
        }
        return compareHeures;
      });
  }

  getCategorieCode(rencontre:Rencontre):string{
      return getCategorieChampionnatCode(rencontre.division.championnat) + rencontre.division.pointsMaximum;
  }

  addJournee(){
    let journeeCriteriumDialogRef = this.dialog.open(JourneeCriteriumDialog, {
        data: {}, panelClass: "journeeCriteriumDialog", disableClose:true
    });

    journeeCriteriumDialogRef.afterClosed().subscribe(journee => {
      if (journee){
        this.journees.push(journee);
        this.triJournees();
      }});
  }

  addHoraire(journee:Journee){
    let horaireCriteriumDialogRef = this.dialog.open(HoraireJourneeCriteriumDialog, {
        data: {}, panelClass: "horaireCriteriumDialog", disableClose:true
    });

    horaireCriteriumDialogRef.afterClosed().subscribe(horaire => {
      if (horaire){
        journee.horaires.push(horaire);
        this.triHoraires(journee);
      }});

  }

  choixRencontre(){
    let choixRencontreDialogRef = this.dialog.open(ChoixRencontreCriteriumDialog, {
        data: {}, panelClass: "choixRencontreDialog", disableClose:true
    });
  }

    formatHeureMinutes(heures:number, minutes:number): string {
        return " " + addLeadingZero(heures) + "h" + addLeadingZero(minutes);
    }

}

@Component({
    selector: 'journee-criterium-dialog',
    templateUrl: './journeeCriterium.html'
})
export class JourneeCriteriumDialog {

    date:Date;

    constructor(
        public dialogRef: MatDialogRef<JourneeCriteriumDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        }

    save(): void {
        if (this.date){
          let journee = new Journee();
          journee.date=this.date;
          this.dialogRef.close(journee);
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'horaire-journee-criterium-dialog',
    templateUrl: './horaireJourneeCriterium.html'
})
export class HoraireJourneeCriteriumDialog {

    heures:number;
    minutes:number;

    constructor(
        public dialogRef: MatDialogRef<HoraireJourneeCriteriumDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        }

    save(): void {
        if (this.heures && this.minutes){
          let horaire = new Horaire();
          horaire.heures=this.heures;
          horaire.minutes=this.minutes;
          this.dialogRef.close(horaire);
        }
    }

    cancel(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'choix-rencontre-criterium-dialog',
    templateUrl: './choixRencontreCriterium.html'
})
export class ChoixRencontreCriteriumDialog {

    constructor(
        public dialogRef: MatDialogRef<ChoixRencontreCriteriumDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        }

    cancel(): void {
        this.dialogRef.close();
    }
}

export class Journee {
  date:Date;
  terrain:Terrain;
  horaires:Horaire[]=[];
}

export class Horaire {
  heures:number;
  minutes:number;
  rencontres:Rencontre[]=[];
}
