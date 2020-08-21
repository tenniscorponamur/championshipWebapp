import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import {compare} from '../utility';
import {ChampionnatService} from '../championnat.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {Equipe, EquipeExtended} from '../equipe';
import {Poule} from '../poule';
import {Division} from '../division';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Observable} from 'rxjs/Observable';
import {Terrain} from '../terrain';
import {Championnat,getCategorieChampionnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, TYPE_CHAMPIONNAT_COUPE_HIVER} from '../championnat';
import {Membre} from '../membre';

@Component({
  selector: 'app-composition-equipe-dialog',
  templateUrl: './composition-equipe-dialog.component.html',
  styleUrls: ['./composition-equipe-dialog.component.css']
})
export class CompositionEquipeDialogComponent {

    private genre:string;
    private equipeExtended: EquipeExtended;
    membresEquipe:Membre[]=[];

    constructor(
        public dialog: MatDialog,
        private equipeService:EquipeService,
        public dialogRef: MatDialogRef<CompositionEquipeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.equipeExtended = data.equipeExtended;
        this.genre = data.genre;
        this.membresEquipe = this.equipeExtended.membresEquipe;

    }

    ajouterMembre(){
      let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
          data: {club: this.equipeExtended.equipe.club, genre:this.genre, deselectionPossible:false, anyMemberPossible: this.equipeExtended.equipe.hybride, membresARetirer:this.membresEquipe}, panelClass: "membreSelectionDialog", disableClose: false
      });
      membreSelectionRef.afterClosed().subscribe(membre => {
          if (membre!==undefined) {
            this.equipeService.addMembreEquipe(this.equipeExtended.equipe, membre).subscribe(
              membreAdded => {
                 if (membreAdded) {
                    this.membresEquipe.push(membre);
                  }
              });
          }
      });
    }

    retirerMembre(membreARetirer:Membre){
      this.equipeService.deleteMembreEquipe(this.equipeExtended.equipe, membreARetirer).subscribe(
        membreDeleted => {
           if (membreDeleted) {
              let index = this.membresEquipe.findIndex(membre => membre.id == membreARetirer.id);
              if (index!=-1){
                  this.membresEquipe.splice(index,1);
              }
            }
        });
    }

    getPointsEquipe():number{
      let points:number = 0;
      this.membresEquipe.forEach(membre => {
        if (membre.classementCorpoActuel){
          points=points+membre.classementCorpoActuel.points;
        }
      });
      return points;
    }

    getPointsEquipeLimitedToFour(ordreCroissant:boolean):number{
      // Dans le cadre des championnats et coupe d'hiver, on va regarder les 4 moins bien classes
      let points:number = 0;
      let cpt=0;
      this.membresEquipe.sort((a, b) => {
          let pointsA = (a.classementCorpoActuel!=null)?a.classementCorpoActuel.points:null;
          let pointsB = (b.classementCorpoActuel!=null)?b.classementCorpoActuel.points:null;
          return compare(pointsA, pointsB, ordreCroissant);
        })
        .forEach(membre => {
        if (membre.classementCorpoActuel){
          if (cpt < 4){
            points=points+membre.classementCorpoActuel.points;
          }
          cpt++;
        }
      });
      return points;
    }

    isCriterium(){
      return this.equipeExtended.equipe.division.championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code;
    }

    fermerSelection() {
        this.dialogRef.close();
    }

}

