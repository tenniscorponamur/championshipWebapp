import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-rencontre-detail',
  templateUrl: './rencontre-detail.component.html',
  styleUrls: ['./rencontre-detail.component.css']
})
export class RencontreDetailComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }


  ouvrirMatch(): void {
    let matchDialogRef = this.dialog.open(MatchDialog, {
      data: {  }, panelClass: "matchDialog", disableClose:false
    });

    matchDialogRef.afterClosed().subscribe(result => {
      console.log('Le match a ete ferme');
    });
  }

}


@Component({
  selector: 'match-dialog',
  templateUrl: './matchDialog.html',
  styleUrls: ['./matchDialog.css']
})
export class MatchDialog {

  constructor(
    public dialogRef: MatDialogRef<MatchDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close();
  }

}
