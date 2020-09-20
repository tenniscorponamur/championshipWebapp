import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Championnat,TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';
import {Division} from '../division';
import {Poule} from '../poule';
import {Equipe} from '../equipe';
import {Rencontre} from '../rencontre';
import {ChampionnatService} from '../championnat.service';
import {RencontreService} from '../rencontre.service';
import {DivisionService} from '../division.service';
import {PouleService} from '../poule.service';
import {EquipeService} from '../equipe.service';
import {ClubService} from '../club.service';
import {compare} from '../utility';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';

@Component({
  selector: 'app-championnat-administration-rencontres',
  templateUrl: './championnat-administration-rencontres.component.html',
  styleUrls: ['./championnat-administration-rencontres.component.css']
})
export class ChampionnatAdministrationRencontresComponent extends ChampionnatDetailComponent implements OnInit {

  championnats: Championnat[]=[];
  divisions: Division[]=[];
  poules: Poule[]=[];
  rencontres:Rencontre[]=[];

  selectedChampionnat:Championnat;
  selectedDivision:Division;
  selectedPoule:Poule;

  constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private rencontreService: RencontreService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private clubService: ClubService
  ) {
        super();
 }

  ngOnInit() {
      this.championnatService.getChampionnats().subscribe(championnats => {
          this.championnats = championnats.filter(championnat => championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code).sort((a, b) => compare(a.ordre, b.ordre, false));
      });
  }

  refresh(){
    this.selectedChampionnat=null;
    this.selectedDivision=null;
    this.selectedPoule=null;
    this.divisions=[];
    this.poules=[];
  }

  loadDivisions(){
    this.selectedDivision=null;
    this.selectedPoule=null;
    this.divisions=[];
    this.poules=[];
    this.rencontres=[];
    this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(divisions => {
        this.divisions = divisions.sort((a, b) => compare(a.numero, b.numero, true));
    });
  }

  loadPoules(){
      this.selectedPoule=null;
      this.poules=[];
      this.rencontres=[];
      this.pouleService.getPoules(this.selectedDivision.id).subscribe(poules => {
          this.poules = poules.sort((a, b) => compare(a.numero, b.numero, true));
      });

  }

  loadRencontres(){
      this.rencontres=[];
      this.rencontreService.getRencontres(this.selectedDivision.id, this.selectedPoule.id,null).subscribe(rencontresPoule => {
          this.rencontres = rencontresPoule.filter(rencontre => rencontre.dateHeureRencontre==null);
      });
  }

  supprimerRencontre(rencontre:Rencontre){
      let confirmationSuppressionDialogRef = this.dialog.open(ConfirmationSuppressionDialog, {
          data: {rencontre: rencontre}, panelClass: "confirmationSuppressionDialog", disableClose:true
      });

     confirmationSuppressionDialogRef.afterClosed().subscribe(rencontreDeleted => {
        if (rencontreDeleted!==undefined) {
            let index = this.rencontres.findIndex(rencontre => rencontre.id == rencontreDeleted.id);
            if (index!=-1){
                this.rencontres.splice(index,1);
            }
        }
      });
  }

  ajouterRencontre(){
      let ajoutRencontreDialogRef = this.dialog.open(AjoutRencontreDialog, {
          data: {championnat:this.selectedChampionnat, division:this.selectedDivision, poule:this.selectedPoule}, panelClass: "ajoutRencontreDialog", disableClose:true
      });

     ajoutRencontreDialogRef.afterClosed().subscribe(rencontre => {
        if (rencontre!==undefined) {
          this.rencontres.push(rencontre);
        }
      });
  }


}

@Component({
    selector: 'ajout-rencontre-dialog',
    templateUrl: './ajoutRencontreDialog.html'
})
export class AjoutRencontreDialog extends ChampionnatDetailComponent implements OnInit {

    championnat:Championnat;
    division:Division;
    poule:Poule;

    equipes:Equipe[]=[];

    numeroJournee:number;
    equipeVisites:Equipe;
    equipeVisiteurs:Equipe;

    constructor(
        public dialogRef: MatDialogRef<AjoutRencontreDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private equipeService:EquipeService,
        private rencontreService: RencontreService) {
        super();
        this.championnat = data.championnat;
        this.division = data.division;
        this.poule = data.poule;
    }

    ngOnInit() {
        this.equipeService.getEquipes(this.division.id,this.poule.id).subscribe(equipes => {
            this.equipes = equipes.sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique,true));
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }

    creerRencontre(): void {


      if (this.numeroJournee && this.equipeVisites && this.equipeVisiteurs){
        let rencontre:Rencontre=new Rencontre();

        rencontre.numeroJournee=this.numeroJournee;
        rencontre.division=this.division;
        rencontre.poule=this.poule;
        rencontre.equipeVisites=this.equipeVisites;
        rencontre.equipeVisiteurs=this.equipeVisiteurs;

        this.rencontreService.createRencontre(rencontre).subscribe(
            rencontreSaved => {
                this.dialogRef.close(rencontreSaved);
         });

      }
    }
}



@Component({
    selector: 'confirmation-suppression-dialog',
    templateUrl: './confirmationSuppressionDialog.html'
})
export class ConfirmationSuppressionDialog {

    rencontre:Rencontre;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationSuppressionDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private rencontreService: RencontreService) {

        this.rencontre = data.rencontre;
    }

    cancel(): void {
        this.dialogRef.close();
    }

    confirmerSuppression(): void {

        this.rencontreService.deleteRencontre(this.rencontre).subscribe(
            result => {
            if (result){
                this.dialogRef.close(this.rencontre);
            }
         });
    }
}

