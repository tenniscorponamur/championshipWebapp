import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { AuthenticationService } from './authentication.service';
import {LocalStorageService} from './local-storage.service';
import {UserService} from './user.service';
import {User} from './user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Tennis Corpo Namur';

  constructor(
      private router:Router,
      private authenticationService: AuthenticationService,
      private userService: UserService,
      private localStorageService:LocalStorageService,
      public dialog: MatDialog) {

        if (!this.cookiePref){
          this.cookiePopup();
        }

     }

    get user(): User {return this.authenticationService.getConnectedUser(); }

    get cookiePref(): boolean {
      return this.localStorageService.isCookieAuthorized();
    }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(
      user => {
          this.authenticationService.setConnectedUser(user);
        }
      );
  }

  cookiePopup(){

    let cookieDialogRef = this.dialog.open(CookieDialog, {
      data: { }, panelClass: "cookieDialog", disableClose:true
    });

    cookieDialogRef.afterClosed().subscribe(accept => {
      if (accept){
        this.localStorageService.storeCookiePreference("true");
      }else{
        this.authenticationService.disconnect();
        this.localStorageService.clearLocalStorage();
        this.router.navigate(['/home']);
      }
    });

  }

  ouvrirLoginForm(): void {
    let loginFormDialogRef = this.dialog.open(LoginFormDialog, {
      data: { }, panelClass: "loginFormDialog", disableClose:false
    });

    loginFormDialogRef.afterClosed().subscribe(result => {
      if (result){
        // Recuperation des informations de l'utilisateur
        this.userService.getCurrentUser().subscribe(user => {
            this.authenticationService.setConnectedUser(user);
            this.router.navigate(['/home']);
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
        this.router.navigate(['/home']);
      }else{
        //console.log('La fenetre de login a ete fermee sans deconnexion');
      }
    });
  }

}

@Component({
  selector: 'cookie-dialog',
  templateUrl: './cookie.html',
})
export class CookieDialog {

  constructor(public dialogRef: MatDialogRef<LoginFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    accept(){
      this.dialogRef.close(true);
    }

    decline(){
      this.dialogRef.close(false);
    }

    cancel(): void {
        this.dialogRef.close();
    }


    //TODO :
    // disconnect
    // + delete other keys
    // + cookie pref


}


@Component({
  selector: 'login-form-dialog',
  templateUrl: './loginForm.html',
})
export class LoginFormDialog {

  _login:string;
  _password:string;
  _rememberMe:boolean=true;
  showAlert:boolean=false;

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
             this.showAlert=true;
             //TODO : gestion des erreurs de connexion (mot de passe incorrect)
            console.log("bad credentials");
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

  cancel(): void {
      this.dialogRef.close();
  }

  deconnexion(): void {
    this.dialogRef.close(true);
  }

}
