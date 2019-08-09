import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {compare, addLeadingZero} from '../utility';
import {Division} from '../division';
import {Rencontre} from '../rencontre';
import {Terrain,Court} from '../terrain';
import {RencontreService} from '../rencontre.service';
import {getCategorieChampionnatCode,CategorieChampionnat, CATEGORIES_CHAMPIONNAT, CATEGORIE_CHAMPIONNAT_MIXTES,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {ChampionnatService} from '../championnat.service';
import {TerrainService} from '../terrain.service';

@Component({
  selector: 'app-planification-criterium',
  templateUrl: './planification-criterium.component.html',
  styleUrls: ['./planification-criterium.component.css']
})
export class PlanificationCriteriumComponent implements OnInit {

  annee:string;
  rencontres:Rencontre[]=[];
  journees:Journee[]=[];

  chargementRencontres:boolean=true;
  criteriumEditable:boolean=false;

  constructor(
        public dialog: MatDialog,
        private terrainService:TerrainService,
        private championnatService:ChampionnatService,
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
    this.chargementRencontres=true;
    this.rencontreService.getRencontresCriteriumByAnnee(this.annee).subscribe(rencontres => {
      this.rencontres = rencontres;
      this.createCalendrier();
      this.chargementRencontres=false;
    });
    this.championnatService.isCriteriumEditable(this.annee).subscribe(editable => this.criteriumEditable = editable);
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
          selectedJournee = new Journee(this.terrainService, rencontre.dateHeureRencontre,rencontre.terrain);
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
        selectedHoraire.addRencontre(rencontre);
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

  isRencontreDame(rencontre:Rencontre){
    return   rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code;
  }

  isRencontreDoubleDame(rencontre:Rencontre){
    return rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code;
  }

  isRencontreHomme(rencontre:Rencontre){
    return   rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code
          || rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_MIXTES.code;
  }

  isRencontreDoubleHomme(rencontre:Rencontre){
    return rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code;
  }

  addJournee(){
    if (this.criteriumEditable){
      let journeeCriteriumDialogRef = this.dialog.open(JourneeCriteriumDialog, {
          data: {}, panelClass: "journeeCriteriumDialog", disableClose:true
      });

      journeeCriteriumDialogRef.afterClosed().subscribe(journee => {
        if (journee){
          this.journees.push(journee);
          this.triJournees();
        }});
    }
  }

  addHoraire(journee:Journee){
    if (this.criteriumEditable){
      let horaireCriteriumDialogRef = this.dialog.open(HoraireJourneeCriteriumDialog, {
          data: {}, panelClass: "horaireCriteriumDialog", disableClose:true
      });

      horaireCriteriumDialogRef.afterClosed().subscribe(horaire => {
        if (horaire){
          journee.horaires.push(horaire);
          this.triHoraires(journee);
        }});
    }
  }

  choixRencontre(journee:Journee,horaire:Horaire){
    if (this.criteriumEditable){
      let choixRencontreDialogRef = this.dialog.open(ChoixRencontreCriteriumDialog, {
          data: {journee:journee,horaire:horaire,rencontres:this.rencontres}, panelClass: "choixRencontreDialog", disableClose:true
      });
    }
  }

  formatHeureMinutes(heures:number, minutes:number): string {
      return " " + addLeadingZero(heures) + "h" + addLeadingZero(minutes);
  }

  changeCourt(journee:Journee,rencontre:RencontreExtended){
    if (this.criteriumEditable){
      let selectedCourt = journee.courts.find(court => court.id == rencontre.courtId);
      rencontre.rencontre.court=selectedCourt;
      this.rencontreService.updateRencontre(rencontre.rencontre).subscribe();
    }
  }

  deplanifierRencontre(horaire:Horaire,rencontre:Rencontre){
    if (this.criteriumEditable){
      rencontre.dateHeureRencontre=null;
      rencontre.terrain=null;
      rencontre.court=null;

      this.rencontreService.updateRencontre(rencontre).subscribe(rencontre => {
        let index = horaire.rencontres.findIndex(rencontreExtended => rencontreExtended.rencontre.id == rencontre.id);
        if (index!=-1){
            horaire.rencontres.splice(index,1);
        }
      });
    }
  }

}

@Component({
    selector: 'journee-criterium-dialog',
    templateUrl: './journeeCriterium.html'
})
export class JourneeCriteriumDialog implements OnInit {

    date:Date;
    terrainId:number;
    terrains:Terrain[];

    constructor(
        private terrainService: TerrainService,
        public dialogRef: MatDialogRef<JourneeCriteriumDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        }

    ngOnInit() {
        this.terrainService.getTerrains().subscribe(terrains => {
          this.terrains = terrains.sort((a, b) => compare(a.nom,b.nom,true));
          this.terrains.forEach(terrain => {
            if (terrain.terrainCriteriumParDefaut){
              this.terrainId = terrain.id;
            }
          });
        });
    }

    save(): void {
        if (this.date && this.terrainId){
          let selectedTerrain = this.terrains.find(terrain => terrain.id == this.terrainId);
          let journee = new Journee(this.terrainService, this.date,selectedTerrain);
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
    templateUrl: './choixRencontreCriterium.html',
    styleUrls: ['./choixRencontreCriterium.css']
})
export class ChoixRencontreCriteriumDialog implements OnInit {

  journee:Journee;
  horaire:Horaire;
  rencontres:Rencontre[]=[];
  filteredRencontres:Rencontre[]=[];

  categories:CategorieChampionnat[]=[CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_MIXTES];
  divisions:Division[]=[];

  categorieCode:string;
  divisionId:number;
  numeroJournee:number;

    constructor(private rencontreService:RencontreService,
        public dialogRef: MatDialogRef<ChoixRencontreCriteriumDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.journee=data.journee;
          this.horaire=data.horaire;
          this.rencontres=data.rencontres.filter(rencontre => !rencontre.dateHeureRencontre);
          this.rencontres.sort((a,b) => {
            let compareCategorie = compare(a.division.championnat.categorie,b.division.championnat.categorie,true);
            if (compareCategorie==0){
              let compareDivision = compare(a.division.pointsMaximum,b.division.pointsMaximum,true);
              if (compareDivision==0){
                let comparePoule = 0;
                if (a.poule!=null && b.poule!=null){
                  comparePoule = compare(a.poule.numero,b.poule.numero,true);
                }
                if (comparePoule==0){
                  return compare(a.numeroJournee,b.numeroJournee,true);
                }
                return comparePoule;
              }
              return compareDivision;
            }
            return compareCategorie;
          });

    }

    ngOnInit() {
      this.filtre();
    }

    getCategorieCode(rencontre:Rencontre):string{
        return getCategorieChampionnatCode(rencontre.division.championnat) + rencontre.division.pointsMaximum;
    }

    loadDivisions(){
      this.divisions = [];
      this.divisionId=null;

      if (this.categorieCode){
        this.rencontres.forEach(rencontre => {
          if(this.categorieCode==rencontre.division.championnat.categorie){
            let divisionFound = this.divisions.find(division => division.id==rencontre.division.id);
            if (!divisionFound){
              this.divisions.push(rencontre.division);
            }
          }
        });
        this.divisions.sort((a,b)=> compare(a.numero, b.numero, true));
      }

      this.filtre();
    }

    filtre(){
      this.filteredRencontres=this.rencontres;

      // Filtrer les rencontres sur base du code de la categorie et de la division

      if (this.categorieCode){
        this.filteredRencontres=this.filteredRencontres.filter(rencontre => this.categorieCode==rencontre.division.championnat.categorie);
      }
      if (this.divisionId){
        this.filteredRencontres=this.filteredRencontres.filter(rencontre => this.divisionId==rencontre.division.id);
      }
      if (this.numeroJournee){
        this.filteredRencontres=this.filteredRencontres.filter(rencontre => this.numeroJournee==rencontre.numeroJournee);
      }

    }

    choixRencontre(rencontre:Rencontre){
      rencontre.dateHeureRencontre=new Date(this.journee.date);
      rencontre.dateHeureRencontre.setHours(this.horaire.heures);
      rencontre.dateHeureRencontre.setMinutes(this.horaire.minutes);
      rencontre.terrain=this.journee.terrain;

      this.rencontreService.updateRencontre(rencontre).subscribe(rencontre => {
          this.horaire.addRencontre(rencontre);
          this.dialogRef.close();
      });

    }

    cancel(): void {
        this.dialogRef.close();
    }
}

export class Journee {
  date:Date;
  terrain:Terrain;
  horaires:Horaire[]=[];
  courts:Court[]=[];

  constructor(private terrainService:TerrainService, date:Date, terrain:Terrain){
    this.date=date;
    this.terrain=terrain;
    if (terrain){
      this.terrainService.getCourtsTerrain(terrain.id).subscribe(courts => this.courts = courts.sort((a,b)=> compare(a.code,b.code,true)));
    }
  }
}

export class Horaire {
  heures:number;
  minutes:number;
  rencontres:RencontreExtended[]=[];

  addRencontre(rencontre:Rencontre){
    let rencontreExtended = new RencontreExtended();
    rencontreExtended.rencontre=rencontre;
    if (rencontre.court){
      rencontreExtended.courtId=rencontre.court.id;
    }
    this.rencontres.push(rencontreExtended);
    this.rencontres.sort((a,b) => {
      let compareCategorie = compare(a.rencontre.division.championnat.categorie,b.rencontre.division.championnat.categorie,true);
      if (compareCategorie==0){
        return compare(a.rencontre.division.pointsMaximum,b.rencontre.division.pointsMaximum,true);
      }
      return compareCategorie;
    });
  }
}

export class RencontreExtended{
  rencontre:Rencontre;
  courtId:number;
}
