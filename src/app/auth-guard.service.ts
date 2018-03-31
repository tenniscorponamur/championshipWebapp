import { Injectable } from '@angular/core';
import {CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';

@Injectable()
export class AuthGuardService  implements CanActivate {
    
//  canActivate() {
//    console.log('AuthGuard#canActivate called');
//    return true;
//  }

  constructor() { }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    // TODO : si l'url est soumise a du controle, il faut regarder si l'utilisateur est authentifie 
    // deplacer le user connecte dans authenticationService

    //TODO : tester l'url pour autoriser l'acces ou non (l'url correspond a ce qui est defini dans les routeLink de la page html

    console.log(url);
    
    return true;
  }

}
