import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat} from '../championnat';
import {compare} from '../utility';
import {ChampionnatService} from '../championnat.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {PouleService} from '../poule.service';
import {ClubService} from '../club.service';
import {Equipe} from '../equipe';
import {Poule} from '../poule';
import {Division} from '../division';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Observable} from 'rxjs/Observable';
import {Terrain} from '../terrain';
import {TerrainService} from '../terrain.service';

@Component({
  selector: 'app-championnat-poules',
  templateUrl: './championnat-poules.component.html',
  styleUrls: ['./championnat-poules.component.css']
})
export class ChampionnatPoulesComponent extends ChampionnatDetailComponent implements OnInit {

    championnatCtrl: FormControl = new FormControl();

    @Output() selectChampionnat = new EventEmitter<Championnat>();

    championnats: Championnat[];


    selectedChampionnat: Championnat;
    divisions: Division[];
    poules: Poule[] = [];
    equipes: Equipe[] = [];

    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private clubService: ClubService
    ) {
        super();
        this.championnatCtrl = new FormControl();
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
                            equipes.forEach(equipe => this.equipes.push(equipe));
                        });
                        this.pouleService.getPoules(division.id).subscribe(poules => {
                            poules.forEach(poule => this.poules.push(poule));
                        });
                    });
                }
            );
        }
    }

    refresh(championnat: Championnat, flush:boolean) {
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
        let poule = new Poule();
        poule.division = division;
        poule.numero = this.getNbPoulesInDivision(division) + 1;
        this.pouleService.ajoutPoule(division.id, poule).subscribe(newPoule => this.poules.push(newPoule));
    }

    removePoule(pouleToDelete: Poule) {
        this.pouleService.deletePoule(pouleToDelete).subscribe(result => {
            let indexOfPoule = this.poules.findIndex(poule => poule.id == pouleToDelete.id);
            this.poules.splice(indexOfPoule, 1);
        });
    }

    changeTypeCalendrierPoule(poule: Poule){
        this.pouleService.updatePouleAllerRetour(poule.id, !poule.allerRetour).subscribe(result => {
            poule.allerRetour=!poule.allerRetour;
        });
    }

    getNbEquipesInChampionship() {
        return this.equipes.length;
    }

    getNbEquipesByDivision(division: Division) {
        return this.getEquipesByDivision(division).length;
    }

    getEquipesByDivision(division: Division) {
        return this.equipes.filter(equipe => equipe.division.id == division.id);
    }

    getEquipesByPoule(poule: Poule) {
        return this.equipes.filter(equipe => equipe.poule.id == poule.id).sort((a,b) => compare(a.codeAlphabetique, b.codeAlphabetique, true));
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

    editTeam(equipe:Equipe){
        console.log("edit team");
    }

    changePoule(equipe:Equipe){

        let changePouleDialogRef = this.dialog.open(ChangePouleDialog, {
            data: {equipe: equipe, poulesPossibles: this.getPoulesByDivision(equipe.division)}, panelClass: "changePouleDialog"
        });

    }

    ouvrirCapitaineEquipe(equipe:Equipe){

        let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
            data: {club: equipe.club, capitaine: true}, panelClass: "membreSelectionDialog", disableClose: false
        });

        membreSelectionRef.afterClosed().subscribe(membre => {
            if (membre) {
                equipe.capitaine=membre;
                this.equipeService.updateEquipe(equipe.division.id,equipe).subscribe();
            }
        });

    }

    ouvrirTerrainEquipe(equipe:Equipe) {
        let equipeTerrainDialogRef = this.dialog.open(EquipeTerrainDialog, {
          data: { equipe: equipe}, panelClass: "equipeTerrainDialog"
        });

        equipeTerrainDialogRef.afterClosed().subscribe();
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


@Component({
  selector: 'equipe-terrain-dialog',
  templateUrl: './equipeTerrainDialog.html',
})
export class EquipeTerrainDialog {

  terrainCtrl: FormControl=new FormControl();
  terrains:Terrain[];

    _terrainId:number;
    private _equipe:Equipe;

  constructor(
    public dialogRef: MatDialogRef<EquipeTerrainDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private equipeService: EquipeService,
    private terrainService:TerrainService
    ) {

      this.terrainCtrl = new FormControl();
      this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains.sort((a,b) => compare(a.nom,b.nom,true)));

        this._equipe = data.equipe;
        if (this._equipe.terrain){
          this._terrainId = this._equipe.terrain.id;
        }
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      if (this._equipe.id){
          if (this._terrainId){
            this.terrainService.getTerrain(this._terrainId).subscribe(terrain => {
                this._equipe.terrain=terrain;
                this.updateTerrainEquipeAndCloseDialog();
            });
          }else{
              this._equipe.terrain=null;
              this.updateTerrainEquipeAndCloseDialog();
          }
      }
  }

  updateTerrainEquipeAndCloseDialog(){
    //Mise a jour du terrain de l'equipe
      this.equipeService.updateEquipe(this._equipe.division.id,this._equipe).subscribe(
        result => {
            this.dialogRef.close(this._equipe);
     });
  }
}

