import { Injectable } from '@angular/core';
import {Rencontre} from './rencontre';
import {Tache} from './tache';
import {RencontreService} from './rencontre.service';
import {TacheService} from './tache.service';
import {AuthenticationService} from './authentication.service';
import {compare} from './utility';

@Injectable()
export class AlertesService {

  private loaded:boolean=false;
  private rencontresACompleter:Rencontre[]=[];
  private rencontresAValider:Rencontre[]=[];
  private taches:Tache[]=[];

  constructor(
    private authenticationService: AuthenticationService,
    private tacheService:TacheService,
    private rencontreService: RencontreService) { }

  refresh(){
    if (this.authenticationService.isConnected()){
      this.loaded = true;
      this.rencontreService.getRencontresToComplete().subscribe(rencontres => {
        this.rencontresACompleter = rencontres;
      });
      this.rencontreService.getRencontresToValidate().subscribe(rencontres => {
        this.rencontresAValider = rencontres;
      });
      if (this.authenticationService.isResponsableClubUserConnected()){
        this.tacheService.getTaches(false).subscribe(taches => {
          this.taches = taches.sort((a,b) => compare(new Date(a.dateDemande),new Date(b.dateDemande),false));
        });
      }
    }
  }

  getRencontresACompleter(){
    if (!this.loaded){
      this.refresh();
    }
    return this.rencontresACompleter;
  }

  getRencontresAValider(){
    if (!this.loaded){
      this.refresh();
    }
    return this.rencontresAValider;
  }

  getTaches(){
    if (!this.loaded){
      this.refresh();
    }
    return this.taches;
  }

  clear(){
    this.loaded = false;
    this.rencontresACompleter = [];
    this.rencontresAValider = [];
    this.taches = [];
  }

}
