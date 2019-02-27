import { Injectable } from '@angular/core';
import {Rencontre} from './rencontre';
import {RencontreService} from './rencontre.service';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class AlertesService {

  private loaded:boolean=false;
  private rencontresACompleter:Rencontre[]=[];
  private rencontresAValider:Rencontre[]=[];

  constructor(
    private authenticationService: AuthenticationService,
    private rencontreService: RencontreService) { }

  load(){
    if (this.authenticationService.isConnected()){
      this.loaded = true;
      this.rencontreService.getRencontresToComplete().subscribe(rencontres => {
        this.rencontresACompleter = rencontres
      });
      this.rencontreService.getRencontresToValidate().subscribe(rencontres => {
        this.rencontresAValider = rencontres
      });
    }
  }

  getRencontresACompleter(){
    if (!this.loaded){
      this.load();
    }
    return this.rencontresACompleter;
  }

  getRencontresAValider(){
    if (!this.loaded){
      this.load();
    }
    return this.rencontresAValider;
  }

  clear(){
    this.loaded = false;
    this.rencontresACompleter = [];
  }

}
