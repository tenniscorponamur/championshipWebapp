import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { AuthenticationService } from './authentication.service';
import {UserService} from './user.service';
import {User} from './user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    
  title = 'Tennis Corpo Namur';

  constructor(
      private authenticationService: AuthenticationService,
      private userService: UserService,
      public dialog: MatDialog) {

       }

    get user(): User {return this.authenticationService.getConnectedUser(); }
  
  ngOnInit() {
    this.userService.getUser().subscribe(
      user => {
          this.authenticationService.setConnectedUser(user);
        }
      );
  }

  ouvrirLoginForm(): void {
    let loginFormDialogRef = this.dialog.open(LoginFormDialog, {
      data: { }, panelClass: "loginFormDialog", disableClose:false
    });

    loginFormDialogRef.afterClosed().subscribe(result => {
      if (result){
        //TODO : recuperation des informations de l'utilisateur
        this.userService.getUser().subscribe(user => {
            this.authenticationService.setConnectedUser(user);
          });
      }else{
        //console.log('La fenetre de login a ete fermee sans connexion');
      }
    });
  }
  
  ouvrirCompteUtilisateur(): void {
    let compteUtilisateurDialogRef = this.dialog.open(CompteUtilisateurDialog, {
      data: { }, panelClass: "compteUtilisateurDialog", disableClose:false
    });
    
    compteUtilisateurDialogRef.afterClosed().subscribe(result => {
      if (result){
        this.authenticationService.disconnect();  
      }else{
        //console.log('La fenetre de login a ete fermee sans deconnexion');
      }
    });
  }

}

@Component({
  selector: 'login-form-dialog',
  templateUrl: './loginForm.html',
})
export class LoginFormDialog {

  private _login:string;
  private _password:string;
  private _rememberMe:boolean=true;

  constructor(
    private http: HttpClient, private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<LoginFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  connexion(): void {
      this.authenticationService.requestAccessToken(this._login, this._password, this._rememberMe)
     .catch(error => {
        return Observable.throw(error);
     }).subscribe(
        result => {
            if (result){
              //console.log("authentification reussie avec " + this._login);
              this.dialogRef.close(this._login);
            }
          },
         error => {
             //TODO : gestion des erreurs de connexion (mot de passe incorrect)
            console.log("bad credentials " + this._rememberMe);
            console.log(error);
          }
      );
  }

}


@Component({
  selector: 'compte-utilisateur-dialog',
  templateUrl: './compteUtilisateur.html',
})
export class CompteUtilisateurDialog {

  constructor(
    private http: HttpClient, private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<CompteUtilisateurDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    get user(): User {return this.authenticationService.getConnectedUser(); }
    
    changePassword(): void {
        //TODO : permettre de changer le mot de passe
    }

  deconnexion(): void {
    this.dialogRef.close(true);
  }

}
