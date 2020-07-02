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

    fermerSelection() {
        this.dialogRef.close();
    }

}

