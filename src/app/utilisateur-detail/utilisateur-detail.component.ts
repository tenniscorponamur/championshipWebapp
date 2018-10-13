import { Component, OnInit, Inject, Input } from '@angular/core';
import {User} from '../user';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {UserService} from '../user.service';

@Component({
  selector: 'app-utilisateur-detail',
  templateUrl: './utilisateur-detail.component.html',
  styleUrls: ['./utilisateur-detail.component.css']
})
export class UtilisateurDetailComponent implements OnInit {

  @Input()
  utilisateur:User

  constructor(
    public dialog: MatDialog,
    private userService: UserService
    ) { }

  ngOnInit() {
  }

  ouvrirUtilisateurDetail() {
    let userDialogRef = this.dialog.open(UserDialog, {
      data: { utilisateur: this.utilisateur }, panelClass: "userDialog", disableClose:true
    });

    userDialogRef.afterClosed().subscribe(result => {
      console.log("Les informations de l'utilisateur ont ete modifiees a ete ferme : " + result);
    });
  }
    
    resetPassword(){
        this.userService.resetPassword(this.utilisateur).subscribe();
    }

}


@Component({
  selector: 'user-dialog',
  templateUrl: './userDialog.html',
})
export class UserDialog {

    _prenom:string;
    _nom:string;
    _username:string;

    showAlert:boolean=false;

    private _utilisateur:User;

  constructor(
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService) {
        this._utilisateur = data.utilisateur;
        this._prenom = this._utilisateur.prenom;
        this._nom = this._utilisateur.nom;
        this._username = this._utilisateur.username;
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

       // Verification du prenom
      if (this._prenom && this._prenom.trim().length > 0){
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

      // Verification du nom d'utilisateur
      if (this._username){
          //this.showAlert=false;
      }else{
          this.showAlert=true;
      }

      if (!this.showAlert){

        this._utilisateur.prenom=this._prenom;
        this._utilisateur.nom=this._nom;
        this._utilisateur.username=this._username;

        if (!this._utilisateur.id){
            // Ajout d'un nouveal utilisateur
            this.userService.ajoutUtilisateur(this._utilisateur).subscribe(
                user => {
                    this._utilisateur.id=user.id;
                    this.dialogRef.close(this._utilisateur);
             });
        }else{
            //Mise a jour de l'utilisateur
            this.userService.updateUtilisateur(this._utilisateur).subscribe(
                result => {
                    this.dialogRef.close(this._utilisateur);
             });
        }
      }

  }
}

