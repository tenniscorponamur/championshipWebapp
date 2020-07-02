import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import {Championnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES, CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS} from '../championnat';
import {compare} from '../utility';
import {ChampionnatService} from '../championnat.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {PouleService} from '../poule.service';
import {ClubService} from '../club.service';
import {Equipe, EquipeExtended} from '../equipe';
import {Poule} from '../poule';
import {Division} from '../division';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {SelectTerrainDialogComponent} from '../select-terrain-dialog/select-terrain-dialog.component';
import { CompositionEquipeDialogComponent } from '../composition-equipe-dialog/composition-equipe-dialog.component';
import {Observable} from 'rxjs/Observable';
import {Terrain} from '../terrain';
import {Membre} from '../membre';
import {TerrainService} from '../terrain.service';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';

@Component({
  selector: 'app-championnat-poules',
  templateUrl: './championnat-poules.component.html',
  styleUrls: ['./championnat-poules.component.css']
})
export class ChampionnatPoulesComponent extends ChampionnatDetailComponent implements OnInit {

    @Output() selectChampionnat = new EventEmitter<Championnat>();

    championnats: Championnat[];


    selectedChampionnat: Championnat;
    divisions: Division[];
    poules: Poule[] = [];
    equipes: EquipeExtended[] = [];

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private clubService: ClubService
    ) {
        super();
    }


  ngOnInit() {
        this.refresh(null,false);
  }

    loadTeams() {

        this.selectChampionnat.emit(this.selectedChampionnat);

        this.equipes = [];
        this.poules=[];
        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
                    this.divisions.forEach(division => {
                        this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
                            equipes.forEach(equipe => {
                              let equipeExtended=new EquipeExtended();
                              equipeExtended.equipe=equipe;
                              this.equipes.push(equipeExtended);
                              this.loadMembresEquipe(equipeExtended);
                            });
                        });
                        this.pouleService.getPoules(division.id).subscribe(poules => {
                            poules.forEach(poule => this.poules.push(poule));
                        });
                    });
                }
            );
        }
    }

    loadMembresEquipe(equipeExtended:EquipeExtended){
      this.equipeService.getMembresEquipe(equipeExtended.equipe).subscribe(membres => {
        membres.forEach(membre => equipeExtended.membresEquipe.push(membre));
      });
    }

    refresh(championnat: Championnat, flush:boolean) {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort((a, b) => compare(a.ordre, b.ordre, false));
            if (championnat) {
                this.selectedChampionnat = this.championnats.filter(championnatInList => championnatInList.id == championnat.id)[0];
                this.loadTeams();
            }else{
                if (flush){
                    this.selectedChampionnat = null;
                }
            }
        });
    }

    addOnePoule(division: Division) {
      if (!this.selectedChampionnat.calendrierValide){
        let poule = new Poule();
        poule.division = division;
        poule.numero = this.getNbPoulesInDivision(division) + 1;
        this.pouleService.ajoutPoule(division.id, poule).subscribe(newPoule => this.poules.push(newPoule));
      }
    }

    removePoule(pouleToDelete: Poule) {
      if (!this.selectedChampionnat.calendrierValide){
        this.pouleService.deletePoule(pouleToDelete).subscribe(result => {
            let indexOfPoule = this.poules.findIndex(poule => poule.id == pouleToDelete.id);
            this.poules.splice(indexOfPoule, 1);
        });
      }
    }

    changeTypeCalendrierPoule(poule: Poule){
      if (!this.selectedChampionnat.calendrierValide){
        this.pouleService.updatePouleAllerRetour(poule.id, !poule.allerRetour).subscribe(result => {
            poule.allerRetour=!poule.allerRetour;
        });
      }
    }

    getNbEquipesInChampionship() {
        return this.equipes.length;
    }

    getNbEquipesByDivision(division: Division) {
        return this.getEquipesByDivision(division).length;
    }

    getEquipesByDivision(division: Division) {
        return this.equipes.filter(equipe => equipe.equipe.division.id == division.id);
    }

    getEquipesByPoule(poule: Poule) {
        return this.equipes.filter(equipe => equipe.equipe.poule.id == poule.id).sort((a,b) => compare(a.equipe.codeAlphabetique, b.equipe.codeAlphabetique, true));
    }

    getNbEquipesByPoule(poule: Poule) {
        return this.getEquipesByPoule(poule).length;
    }

    getPoulesByDivision(division:Division) {
        return this.poules.filter(poule => poule.division.id == division.id).sort((a, b) => compare(a.numero,b.numero,true));
    }

    getNbPoulesInDivision(division: Division) {
        return this.getPoulesByDivision(division).length;
    }

    changePoule(equipe:Equipe){
      if (!this.selectedChampionnat.calendrierValide){
        let changePouleDialogRef = this.dialog.open(ChangePouleDialog, {
            data: {equipe: equipe, poulesPossibles: this.getPoulesByDivision(equipe.division)}, panelClass: "changePouleDialog", disableClose:true
        });
      }
    }

    ouvrirCompositionEquipe(equipeExtended:EquipeExtended){
      if (!this.selectedChampionnat.cloture){
        let genre:string = this.getGenreChampionnat();
        let compoEquipeRef = this.dialog.open(CompositionEquipeDialogComponent, {
            data: {equipeExtended: equipeExtended, genre:genre}, panelClass: "compositionEquipeDialog", disableClose: false
        });
      }
    }

    ouvrirCapitaineEquipe(equipe:Equipe){
      if (!this.selectedChampionnat.cloture){

        let genre:string = this.getGenreChampionnat();

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: equipe.club, capitaine: true, genre:genre, deselectionPossible:(equipe.capitaine!=null)}, panelClass: "membreSelectionDialog", disableClose: false
        });

        membreSelectionRef.afterClosed().subscribe(membre => {
              if (membre!== undefined){
                equipe.capitaine=membre;
                this.equipeService.updateEquipe(equipe.division.id,equipe).subscribe();
              }
        });
      }
    }

    getGenreChampionnat():string{
        let genre:string;
        if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_MESSIEURS.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code){
          genre = GENRE_HOMME.code;
        } else if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_DAMES.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
        || this.selectedChampionnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code){
          genre = GENRE_FEMME.code;
        } else if (this.selectedChampionnat.categorie==CATEGORIE_CHAMPIONNAT_MIXTES.code){
        }
        return genre;
    }

    ouvrirTerrainEquipe(equipe:Equipe) {
      if (!this.selectedChampionnat.cloture){
        let selectTerrainDialogRef = this.dialog.open(SelectTerrainDialogComponent, {
          data: { equipe: equipe}, panelClass: "selectTerrainDialog", disableClose:true
        });

        selectTerrainDialogRef.afterClosed().subscribe();
      }
    }

    changeHybrideMode(equipe:Equipe){
      if (!this.selectedChampionnat.cloture){
        equipe.hybride=!equipe.hybride;
        this.equipeService.updateEquipe(equipe.division.id,equipe).subscribe();
      }
    }

}

@Component({
    selector: 'change-poule-dialog',
    templateUrl: './changePouleDialog.html',
})
export class ChangePouleDialog {

    private equipe: Equipe;
    poulesPossibles:Poule[];

    constructor(
        private equipeService:EquipeService,
        public dialogRef: MatDialogRef<ChangePouleDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.equipe = data.equipe;
        this.poulesPossibles=data.poulesPossibles;

    }

    changePoule(poule:Poule) {
        this.equipeService.updatePouleEquipe(this.equipe,poule).subscribe(result => {
            this.equipe.poule=poule;
            this.dialogRef.close();
        });
    }

    fermerSelection() {
        this.dialogRef.close();
    }

}

