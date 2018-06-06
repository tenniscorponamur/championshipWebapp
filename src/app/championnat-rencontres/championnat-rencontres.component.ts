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
    divisions: Division[];
    poules: Poule[] = [];
    rencontres: Rencontre[] = [];
    
    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private rencontreService:RencontreService,
        private clubService: ClubService
    ) {
        super();
        this.championnatCtrl = new FormControl();
    }


  ngOnInit() {
        this.refresh(null,false);
  }
  
    loadCalendar() {
        
        this.selectChampionnat.emit(this.selectedChampionnat);
        
        this.poules=[];
        this.rencontres=[];
        
        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
                    this.divisions.forEach(division => {
                        
                        this.rencontreService.getRencontres(division.id, null).subscribe(rencontres => {
                            rencontres.forEach(rencontre => this.rencontres.push(rencontre));
                        });
                                
                        this.pouleService.getPoules(division.id).subscribe(poules => {
                            poules.forEach(poule => {
                                this.poules.push(poule);
                                
                            });
                        });
                    });
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
    
    getPoulesByDivision(division:Division) {
        return this.poules.filter(poule => poule.division.id == division.id).sort((a, b) => compare(a.numero,b.numero,true));
    }
    
    getNbPoulesInDivision(division: Division) {
        return this.getPoulesByDivision(division).length;
    }
    
    getJourneesByPoule(poule:Poule){
        let rencontresPoule = this.getRencontresByPoule(poule);
        let journees:Journee[] = [];
        rencontresPoule.forEach(rencontre => {
            let journee = journees.find(journee => journee.numero==rencontre.numeroJournee);
            if (!journee){
                journee = new Journee();
                journee.numero = rencontre.numeroJournee;
                journees.push(journee);
            }
            journee.rencontres.push(rencontre);
            
        });
        return journees;
    }
    
    getRencontresByPoule(poule: Poule) {
        //TODO : ordonner par journee
        return this.rencontres.filter(rencontre => rencontre.poule.id == poule.id);
    }
    
    creerCalendrier(){
        
        if (this.selectedChampionnat) { 
            this.rencontreService.creerCalendrier(this.selectedChampionnat.id).subscribe(rencontres => {
                this.rencontres = rencontres;
            })
        }
        
    }
    
    supprimerCalendrier(){
        if (this.selectedChampionnat) { 
            this.rencontreService.supprimerCalendrier(this.selectedChampionnat.id).subscribe(result => {
                this.rencontres=[];
            })
        }
    }
    
}

export class Journee {
    numero: number;
    rencontres: Rencontre[]=[];
}

