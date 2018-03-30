import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Tennis Corpo Namur';

  constructor(public dialog: MatDialog) {

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

  ouvrirLoginForm(): void {
    let loginFormDialogRef = this.dialog.open(LoginFormDialog, {
      data: { }, panelClass: "loginFormDialog", disableClose:false
    });

    loginFormDialogRef.afterClosed().subscribe(result => {
      if (result){
        console.log("Connexion avec " + result);
      }else{
        console.log('La fenetre de login a ete fermee sans connexion');
      }
    });
  }

  doTest(){
    console.log("test");
  }

}


@Component({
  selector: 'login-form-dialog',
  templateUrl: './loginForm.html',
})
export class LoginFormDialog {

  private _login:string;
  private _password:string;

  constructor(
    public dialogRef: MatDialogRef<LoginFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  connexion(): void {
    this.dialogRef.close(this._login);
  }

}
