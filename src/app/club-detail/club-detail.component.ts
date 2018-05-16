import { Component, OnInit, Inject, Input } from '@angular/core';
import {Club} from '../club';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';

@Component({
  selector: 'app-club-detail',
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css']
})
export class ClubDetailComponent implements OnInit {

  @Input()
  club: Club;

  constructor(
    public dialog: MatDialog
    ) { }

  ngOnInit() {
  }

  ouvrirClub() {
    let clubDialogRef = this.dialog.open(ClubDialog, {
      data: { club: this.club }, panelClass: "infosGeneralesMembreDialog"
    });

    clubDialogRef.afterClosed().subscribe(result => {
    });
  }

}


@Component({
  selector: 'club-dialog',
  templateUrl: './clubDialog.html',
})
export class ClubDialog {

    _numero:string;
    _nom:string;
    _description:string;

    showAlert:boolean=false;

    private _club:Club;

  constructor(
    public dialogRef: MatDialogRef<ClubDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clubService: ClubService) {

        this._club = data.club;
        this._numero = this._club.numero;
        this._nom = this._club.nom;
        this._description = this._club.description;

    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

       // Verification du numero
      if (this._numero && this._numero.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

    // Verification du nom
      if (this._nom && this._nom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

      if (!this.showAlert){

        this._club.numero=this._numero;
        this._club.nom=this._nom;
        this._club.description=this._description;

        if (!this._club.id){
            // Ajout d'un nouveal utilisateur
            this.clubService.ajoutClub(this._club).subscribe(
                newClub => {
                    this._club.id=newClub.id;
                    this.dialogRef.close(this._club);
             });
        }else{
            //Mise a jour de l'utilisateur
            this.clubService.updateClub(this._club).subscribe(
                result => {
                    this.dialogRef.close(this._club);
             });
        }

      }

  }
}

