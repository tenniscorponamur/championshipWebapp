import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { AuthenticationService } from './authentication.service';
import { AlertesService } from './alertes.service';
import {LocalStorageService} from './local-storage.service';
import {UserService} from './user.service';
import {User} from './user';
import {Router} from '@angular/router';
import {MembreService} from './membre.service';
import {EnvironmentService} from './environment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title:string;

  constructor(
      private router:Router,
      private authenticationService: AuthenticationService,
      private alertesService:AlertesService,
      private userService: UserService,
      private localStorageService:LocalStorageService,
      private environmentService:EnvironmentService,
      public dialog: MatDialog) {

        if (this.environmentService.isProduction()){
          this.title = "Tennis Corpo Namur";
        }else{
          this.title = "*** TEST Corpo ***";
        }

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
    
  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
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
        this.alertesService.clear();
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
        this.alertesService.clear();
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
  styleUrls: ['./loginForm.css']
})
export class LoginFormDialog {

  _login:string;
  _password:string;
  _rememberMe:boolean=true;
  showAlert:boolean=false;

  constructor(private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<LoginFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog) { }

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
            console.log("bad credentials");
            console.log(error);
          }
      );
  }
  
  cancel(): void {
      this.dialogRef.close();
  }
  
  askPassword(){
    let askPasswordDialogRef = this.dialog.open(AskPasswordDialog, {
      data: { }, panelClass: "askPasswordDialog", disableClose:false
    });
  }

}

@Component({
  selector: 'ask-password-dialog',
  templateUrl: './askPassword.html'
})
export class AskPasswordDialog {

    showAlert:boolean=false;
    showSuccess:boolean=false;
    showFailure:boolean=false;
    recaptchaKey:string;

  constructor(private userService: UserService,
    private environmentService: EnvironmentService,
    public dialogRef: MatDialogRef<AskPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        this.recaptchaKey = this.environmentService.getRecaptchaKey();
     }

    
  numeroAft:string;
  private captchaResponse:string;
  
  resolved(captchaResponse: string) {
    this.captchaResponse = captchaResponse;
  }
  
  cancel(): void {
      this.dialogRef.close();
  }
    
  askPassword(): void {
      this.showAlert=false;
      this.showSuccess=false;
      this.showFailure=false;
      
      if (!this.numeroAft || !this.captchaResponse){
          this.showAlert=true;
      }else{
          this.userService.askPassword(this.numeroAft, this.captchaResponse).subscribe(result => {
              this.showSuccess=result;
              this.showFailure=!result;
          });
      }
      
  }
    
}

@Component({
  selector: 'compte-utilisateur-dialog',
  templateUrl: './compteUtilisateur.html',
})
export class CompteUtilisateurDialog {

  showSuccess:boolean=false;

  constructor(private authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<CompteUtilisateurDialog>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

    get user(): User {return this.authenticationService.getConnectedUser(); }

    changePassword(): void {
      this.showSuccess=false;

      let changePasswordDialogRef = this.dialog.open(ChangePasswordDialog, {
        data: { }, panelClass: "changePasswordDialog", disableClose:false
      });

    changePasswordDialogRef.afterClosed().subscribe(result => {
        if (result){
          this.showSuccess=true;
        }
    });

    }

  cancel(): void {
      this.dialogRef.close();
  }

  deconnexion(): void {
    this.dialogRef.close(true);
  }

}

@Component({
  selector: 'change-password-dialog',
  templateUrl: './changePassword.html',
})
export class ChangePasswordDialog {

  _oldPassword:string;
  _newPassword1:string;
  _newPassword2:string;
  alerte:string;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ChangePasswordDialog>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  cancel(): void {
      this.dialogRef.close();
  }

  modifier():void {
      this.alerte = null;

      if (this._oldPassword==null || this._oldPassword == undefined || this._oldPassword.trim() == ''){
        this.alerte = "Veuillez renseigner le mot de passe actuel";
      } else if (this._newPassword1==null || this._newPassword1 == undefined || this._newPassword1.trim() == ''){
        this.alerte = "Le nouveau mot de passe ne peut pas être vide";
      }else if (this._newPassword1!=this._newPassword2) {
        this.alerte = "Les deux mots de passe ne sont pas identiques";
      }else{

        this.userService.changePassword(this._oldPassword,this._newPassword1).subscribe(result => {
          if (!result){
             this.alerte = "Le mot de passe n'a pas pu être modifié"
          }else{
            this.dialogRef.close(true);
          }
        });

      }
  }

}
