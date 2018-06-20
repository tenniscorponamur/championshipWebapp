import { Component, Inject, OnInit, Input } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare,addLeadingZero} from '../utility';

@Component({
  selector: 'app-rencontre-detail',
  templateUrl: './rencontre-detail.component.html',
  styleUrls: ['./rencontre-detail.component.css']
})
export class RencontreDetailComponent extends ChampionnatDetailComponent implements OnInit {

  constructor(public dialog: MatDialog) {
    super();
  }

  ngOnInit() {
  }

  private _rencontre: Rencontre;

  @Input()
  set rencontre(rencontre: Rencontre) {
    this._rencontre = rencontre;
    console.log("rencontre selected");
  }

  get rencontre(): Rencontre { return this._rencontre; }

  ouvrirMatch(): void {
    let matchDialogRef = this.dialog.open(MatchDialog, {
      data: {  }, panelClass: "matchDialog", disableClose:false
    });

    matchDialogRef.afterClosed().subscribe(result => {
      console.log('Le match a ete ferme');
    });
  }

    formatDate(date:Date):string{
        if (date){
            let dateToFormat=new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth()+1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        }else{
            return "";
        }
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
