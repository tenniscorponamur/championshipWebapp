import { Injectable } from '@angular/core';
import {CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class AuthGuardService  implements CanActivate {

//  canActivate() {
//    console.log('AuthGuard#canActivate called');
//    return true;
//  }

  constructor(private authenticationService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

      if (this.authenticationService.isConnected()){
        //console.log(this.authenticationService.getConnectedUser().username);
        return true;
      }else{
        //console.log(url + " not authorized");
        return true;
        //return false;
      }

    // TODO : si l'url est soumise a du controle, il faut regarder si l'utilisateur est authentifie
    // deplacer le user connecte dans authenticationService

    //TODO : tester l'url pour autoriser l'acces ou non (l'url correspond a ce qui est defini dans les routeLink de la page html

  }

}
