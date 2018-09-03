import { Component, OnInit, Inject, Input} from '@angular/core';
import {Classement} from '../classement';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Rencontre } from '../rencontre';
import { Equipe } from '../equipe';
import {RencontreService} from '../rencontre.service';

@Component({
  selector: 'app-classement-detail',
  templateUrl: './classement-detail.component.html',
  styleUrls: ['./classement-detail.component.css']
})
export class ClassementDetailComponent implements OnInit {

  @Input()
  classement: Classement;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  getClassForEquipe(index:number){
    if (index==0){
      return "premier";
    }else{
      return "";
    }
  }

  showRencontres(equipe:Equipe){
      let rencontresRef = this.dialog.open(RencontresDialog, {
          data: {equipe:equipe}, panelClass: "rencontresDialog", disableClose: false
      });
  }

}

@Component({
  selector: 'rencontres-dialog',
  templateUrl: './rencontresDialog.html',
  styles: [' .victoire{color:green;}.defaite{color:red;}.matchNul{color:blue}']
})
export class RencontresDialog implements OnInit {

  equipe:Equipe;
  rencontres:Rencontre[]=[];

  constructor(
    private rencontreService:RencontreService,
    public dialogRef: MatDialogRef<RencontresDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.equipe = data.equipe;
    }

  ngOnInit() {
    this.rencontreService.getRencontres(this.equipe.poule.division.id,this.equipe.poule.id,this.equipe.id).subscribe(rencontres => this.rencontres = rencontres.filter(rencontre => rencontre.valide));
  }

  getResultatClass(rencontre:Rencontre):string{
    if (rencontre.valide){
      if (rencontre.pointsVisites!=null && rencontre.pointsVisiteurs!=null){
          if (rencontre.pointsVisites > rencontre.pointsVisiteurs){
              return this.isVisites(rencontre)?"victoire":"defaite";
          }else if (rencontre.pointsVisites < rencontre.pointsVisiteurs){
              return this.isVisites(rencontre)?"defaite":"victoire";
          }else{
            return "matchNul";
          }
      }
    }
    return "";
  }

  getResultat(rencontre:Rencontre):string{
    if (rencontre.valide){
      if (rencontre.pointsVisites!=null && rencontre.pointsVisiteurs!=null){
          if (rencontre.pointsVisites > rencontre.pointsVisiteurs){
              return this.isVisites(rencontre)?"Victoire":"Défaite";
          }else if (rencontre.pointsVisites < rencontre.pointsVisiteurs){
              return this.isVisites(rencontre)?"Défaite":"Victoire";
          }else{
            return "Match nul"
          }
      }
    }
    return "";
  }

  isVisites(rencontre:Rencontre){
    return rencontre.equipeVisites.id==this.equipe.id;
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
