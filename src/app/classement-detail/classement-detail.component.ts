import { Component, OnInit, Inject, Input} from '@angular/core';
import {Classement} from '../classement';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Equipe } from '../equipe';

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
})
export class RencontresDialog {

  constructor(
    public dialogRef: MatDialogRef<RencontresDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  cancel(): void {
    this.dialogRef.close();
  }

}
