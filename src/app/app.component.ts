import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { AuthenticationService } from './authentication.service';
import {UserService} from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tennis Corpo Namur';

  constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService,
      public dialog: MatDialog) {

    // TODO : si refreshToken existe, faire un appel a une methode securisee de test pour eventuellement rafrachir l'accessToken
    // Si l'appel est concluant, se connecter automatiquement
    // Si l'appel est non-concluant, l'appel au refreshToken va faire en sorte de recuperer un nouveau accessToken
    // Si le refreshToken n'est plus valable, la session doit etre nettoyee
    // et on va faire un refresh de la page afin de reinitialiser le isRefreshingToken de l'interceptor a false

    // TODO : s'il n'y a pas de refreshToken
    // TODO : on fait appel a une methode securisee de test
    // TODO : si appel concluant, connexion ok
    // TODO : si ko, clear de la session pour nettoyer le token perime

   }

   //TODO : gerer le "rememberMe" au niveau de l'authentication service
   
   
   

  ouvrirLoginForm(): void {
    let loginFormDialogRef = this.dialog.open(LoginFormDialog, {
      data: { }, panelClass: "loginFormDialog", disableClose:false
    });

    loginFormDialogRef.afterClosed().subscribe(result => {
      if (result){
        console.log("Connexion avec " + result + " - accessToken recupere");
          this.showConnectedUser();
        //TODO : recuperation des informations de l'utilisateur
        
      }else{
      
        //console.log('La fenetre de login a ete fermee sans connexion');
      
      }
    });
  }

  showConnectedUser(){
      this.userService.getUser().subscribe(user => console.log(user.principal));
  }

  disconnect(){
    this.authenticationService.disconnect();
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
              console.log("authentification reussie avec " + this._login);
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
