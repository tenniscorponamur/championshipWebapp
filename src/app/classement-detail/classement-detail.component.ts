import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Equipe } from '../equipe';

@Component({
  selector: 'app-classement-detail',
  templateUrl: './classement-detail.component.html',
  styleUrls: ['./classement-detail.component.css']
})
export class ClassementDetailComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
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
