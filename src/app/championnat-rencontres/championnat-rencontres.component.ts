import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat} from '../championnat';
import {compare} from '../utility';
import {ChampionnatService} from '../championnat.service';
import {MatDialog, MatDatepickerInputEvent} from '@angular/material';
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
    calendarToRefresh:boolean=false;
    calendarValidable:boolean=false;
    calendarInvalidable:boolean=false;
    calendarDeletable:boolean=false;

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

                              this.rencontreService.getRencontres(division.id, null,null).subscribe(rencontresDivision => {

                                  poules.forEach(poule => {
                                      let pouleExtended = new PouleExtended();
                                      pouleExtended.poule = poule;
                                      divisionExtended.poules.push(pouleExtended);
                                      let rencontresPoule = rencontresDivision.filter(rencontre => {
                                        if (rencontre.poule!=null){
                                          return rencontre.poule.id == poule.id;
                                        }
                                        return false;
                                      });
                                      this.ordonnerRencontresParPoule(rencontresPoule,pouleExtended);
                                  });

                                  divisionExtended.poules.sort((a, b) => {return compare(a.poule.numero, b.poule.numero, true)});

                                  let rencontresInterseries = rencontresDivision.filter(rencontre => rencontre.poule==null);
                                  rencontresInterseries.forEach(rencontre => {
                                      divisionExtended.interseries.push(new RencontreExtended(rencontre));
                                  });

                                });

                        });
                      });
                      this.divisions = this.divisions.sort((a, b) => {return compare(a.division.numero, b.division.numero, true)});
                }
            );

            this.refreshStateBooleans();
        }
    }

    refreshStateBooleans(){
          this.championnatService.isCalendrierARafraichir(this.selectedChampionnat).subscribe(toRefresh => {this.calendarToRefresh = toRefresh;});
          this.championnatService.isCalendrierValidable(this.selectedChampionnat).subscribe(validable => {this.calendarValidable = validable;});
          this.championnatService.isCalendrierInvalidable(this.selectedChampionnat).subscribe(invalidable => {this.calendarInvalidable = invalidable;});
          this.championnatService.isCalendrierDeletable(this.selectedChampionnat).subscribe(deletable => {this.calendarDeletable = deletable;});
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
                this.refreshStateBooleans();
            })
        }

    }

    rafraichirCalendrier(){
        if (this.selectedChampionnat) {
          this.rencontreService.refreshCalendrier(this.selectedChampionnat.id).subscribe(rencontres => {
                this.nbRencontres=0;
                this.divisions.forEach(divisionExtended => {
                  divisionExtended.poules.forEach( pouleExtended => {
                    pouleExtended.journees=[];
                    let rencontresPoule = rencontres.filter(rencontre => rencontre.poule.id == pouleExtended.poule.id);
                    this.ordonnerRencontresParPoule(rencontresPoule, pouleExtended);
                  });
                });
                this.selectedChampionnat.calendrierARafraichir=false;
                this.refreshStateBooleans();
            })
        }
    }

    validerCalendrier(){
        if (this.selectedChampionnat) {
            this.championnatService.updateValiditeChampionnat(this.selectedChampionnat,true).subscribe(result => {
                if (result){
                    this.selectedChampionnat.calendrierValide=true;
                    this.refreshStateBooleans();
                }
              });
        }
    }

    invaliderCalendrier(){
        if (this.selectedChampionnat) {
            this.championnatService.updateValiditeChampionnat(this.selectedChampionnat,false).subscribe(result => {
                if (result){
                    this.selectedChampionnat.calendrierValide=false;
                    this.refreshStateBooleans();
                }
              });
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

    changeDate(rencontre:RencontreExtended){
      if (!this.selectedChampionnat.cloture){
        if (rencontre.date!=null && rencontre.heure!=null && rencontre.minute!=null){
            rencontre.rencontre.dateHeureRencontre = new Date(rencontre.date);
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
        }else{
          rencontre.rencontre.dateHeureRencontre = null;
          this.rencontreService.updateRencontre(rencontre.rencontre).subscribe();
        }
      }
    }

    changeTerrain(rencontre:RencontreExtended){
      if (!this.selectedChampionnat.cloture){
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
      if (!this.selectedChampionnat.cloture){
        if (!rencontre.rencontre.valide){
          this.inverserEquipes(rencontre);
          this.rencontreService.updateRencontre(rencontre.rencontre).subscribe(
          result => {
           },
          error => {
            this.inverserEquipes(rencontre);
           });
        }
      }
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
    interseries:RencontreExtended[]=[];
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

