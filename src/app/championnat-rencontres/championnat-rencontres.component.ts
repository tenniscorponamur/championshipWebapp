import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat} from '../championnat';
import {compare} from '../utility';
import {ChampionnatService} from '../championnat.service';
import {MatDialog} from '@angular/material';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {PouleService} from '../poule.service';
import {ClubService} from '../club.service';
import {Equipe} from '../equipe';
import {Poule} from '../poule';
import {Division} from '../division';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {Rencontre} from '../rencontre';
import {RencontreService} from '../rencontre.service';
import {Terrain} from '../terrain';
import {TerrainService} from '../terrain.service';

@Component({
  selector: 'app-championnat-rencontres',
  templateUrl: './championnat-rencontres.component.html',
  styleUrls: ['./championnat-rencontres.component.css']
})
export class ChampionnatRencontresComponent extends ChampionnatDetailComponent implements OnInit {

  // Configuration of the time picker (format 12H with a default date and time)
   config = { hour: 18, minute: 0, meriden: 'PM', format: 24 };
  
    championnatCtrl: FormControl = new FormControl();
    
    @Output() selectChampionnat = new EventEmitter<Championnat>();
    
    championnats: Championnat[];
    
    selectedChampionnat: Championnat;
    divisions: DivisionExtended[];
    nbRencontres:number;
    
    terrains:Terrain[];
  
    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private rencontreService:RencontreService,
        private clubService: ClubService,
        private terrainService: TerrainService
    ) {
        super();
        this.championnatCtrl = new FormControl();
    }


  ngOnInit() {
        this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains);
        this.refresh(null,false);
  }
  
    loadCalendar() {
        
        this.selectChampionnat.emit(this.selectedChampionnat);
        
        this.divisions=[];
        this.nbRencontres=0;
        
        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    divisions.forEach(division => {
                        let divisionExtended = new DivisionExtended();
                        divisionExtended.division = division;
                        this.divisions.push(divisionExtended);

                        this.pouleService.getPoules(division.id).subscribe(poules => {
                            poules.forEach(poule => {
                                let pouleExtended = new PouleExtended();
                                pouleExtended.poule = poule;
                                divisionExtended.poules.push(pouleExtended);
                                this.rencontreService.getRencontres(division.id, poule.id).subscribe(rencontresPoule => {
                                  this.ordonnerRencontresParPoule(rencontresPoule,pouleExtended);
                                });
                            });
                            divisionExtended.poules.sort((a, b) => {return compare(a.poule.numero, b.poule.numero, true)});
                        });
                      });
                      this.divisions = this.divisions.sort((a, b) => {return compare(a.division.numero, b.division.numero, true)});
                }
            );
        }
    }
  
    refresh(championnat: Championnat,flush:boolean) {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort(
                (a, b) => {
                    let comparaisonAnnee = compare(a.annee, b.annee, false);
                    if (comparaisonAnnee != 0) {
                        return comparaisonAnnee;
                    } else {
                        let comparaisonType = compare(a.type, b.type, true);
                        if (comparaisonType != 0) {
                            return comparaisonType;
                        } else {
                            return compare(a.categorie, b.categorie, true);
                        }
                    }
                });

            if (championnat) {
                this.selectedChampionnat = this.championnats.filter(championnatInList => championnatInList.id == championnat.id)[0];
                this.loadCalendar();
            }else{
                if (flush){
                    this.selectedChampionnat = null;
                }
            }
        });
    }
    
    creerCalendrier(){
        
        if (this.selectedChampionnat) { 
            this.rencontreService.creerCalendrier(this.selectedChampionnat.id).subscribe(rencontres => {
                this.divisions.forEach(divisionExtended => {
                  divisionExtended.poules.forEach( pouleExtended => {
                    let rencontresPoule = rencontres.filter(rencontre => rencontre.poule.id == pouleExtended.poule.id);
                    this.ordonnerRencontresParPoule(rencontresPoule, pouleExtended);
                  });
                });
            })
        }
        
    }
    
    supprimerCalendrier(){
        if (this.selectedChampionnat) { 
            this.rencontreService.supprimerCalendrier(this.selectedChampionnat.id).subscribe(result => {
                this.divisions.forEach(divisionExtended => {
                  divisionExtended.poules.forEach( pouleExtended => {
                    pouleExtended.journees=[];
                  });
                });
                this.nbRencontres=0;
            })
        }
    }
    
    
    ordonnerRencontresParPoule(rencontresPoule:Rencontre[], pouleExtended:PouleExtended){
      rencontresPoule.forEach(rencontre => {
          let journee = pouleExtended.journees.find(journee => journee.numero==rencontre.numeroJournee);
          if (!journee){
              journee = new Journee();
              journee.numero = rencontre.numeroJournee;
              pouleExtended.journees.push(journee);
          }
          journee.rencontres.push(new RencontreExtended(rencontre));
          this.nbRencontres++;
      });
      pouleExtended.journees = pouleExtended.journees.sort((a, b) => {return compare(a.numero, b.numero, true)});
      
      pouleExtended.journees.forEach(journee => journee.rencontres.sort((a, b) => {return compare(a.rencontre.id, b.rencontre.id, true)}));
    }
    
//    changeDateRencontre(rencontre:Rencontre){
//
//    }
    
    changeDate(rencontre:RencontreExtended){
        
        if (rencontre.date && rencontre.heure && rencontre.minute){
            
            rencontre.rencontre.dateHeureRencontre = rencontre.date;
            rencontre.rencontre.dateHeureRencontre.setHours(rencontre.heure);
            rencontre.rencontre.dateHeureRencontre.setMinutes(rencontre.minute);

            this.rencontreService.updateRencontre(rencontre.rencontre).subscribe(
            result => {
             },
            error => {
                console.log("erreur save date rencontre");
                rencontre.rencontre.dateHeureRencontre=null;
                rencontre.date=null;
                rencontre.heure=null;
                rencontre.minute=null;
             });
        }
        
    }
    
    changeTerrain(rencontre:RencontreExtended){
        if (rencontre.terrainId){
            this.terrainService.getTerrain(rencontre.terrainId).subscribe(terrain => {
                rencontre.rencontre.terrain=terrain;
                this.updateTerrainRencontre(rencontre);
            });
        }else{
            rencontre.rencontre.terrain=null;
            this.updateTerrainRencontre(rencontre);
        }
        
    }
    
  updateTerrainRencontre(rencontre:RencontreExtended){
    //Mise a jour du terrain de la rencontre
    this.rencontreService.updateRencontre(rencontre.rencontre).subscribe(
    result => {
     },
    error => {
        console.log("erreur save terrain rencontre");
        rencontre.terrainId=null;
        rencontre.rencontre.terrain=null;
     }); 
  }
  
  switchTeams(rencontre:RencontreExtended){
      
    this.inverserEquipes(rencontre);

    this.rencontreService.updateRencontre(rencontre.rencontre).subscribe(
    result => {
     },
    error => { 
      this.inverserEquipes(rencontre);
     }); 
  }
  
  inverserEquipes(rencontre:RencontreExtended){
      
    let oldEquipeVisites = rencontre.rencontre.equipeVisites;
    rencontre.rencontre.equipeVisites = rencontre.rencontre.equipeVisiteurs;
    rencontre.rencontre.equipeVisiteurs = oldEquipeVisites;
    
    if (rencontre.rencontre.equipeVisites.terrain){
        rencontre.rencontre.terrain = rencontre.rencontre.equipeVisites.terrain;
        rencontre.terrainId = rencontre.rencontre.equipeVisites.terrain.id;
    }else{
        rencontre.rencontre.terrain = null;
        rencontre.terrainId = null;
    }
  }
  
}

class Journee {
    numero: number;
    rencontres: RencontreExtended[]=[];
}

class DivisionExtended {
    division: Division;
    poules:PouleExtended[]=[];
}

class PouleExtended {
    poule:Poule;
    journees:Journee[]=[];
}

class RencontreExtended {
    rencontre:Rencontre;
    date:Date;
    heure:number;
    minute:number;
    terrainId:number;
    
    constructor(rencontre:Rencontre){
        this.rencontre=rencontre;
          if (rencontre.dateHeureRencontre){
              this.date=new Date(rencontre.dateHeureRencontre);
              this.heure=this.date.getHours();
              this.minute = this.date.getMinutes();
          }
        if (rencontre.terrain){
            this.terrainId=rencontre.terrain.id;
        }
    }
}

