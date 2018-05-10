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

@Component({
  selector: 'app-championnat-rencontres',
  templateUrl: './championnat-rencontres.component.html',
  styleUrls: ['./championnat-rencontres.component.css']
})
export class ChampionnatRencontresComponent extends ChampionnatDetailComponent implements OnInit {

    championnatCtrl: FormControl = new FormControl();
    
    @Output() selectChampionnat = new EventEmitter<Championnat>();
    
    championnats: Championnat[];
    
    
    selectedChampionnat: Championnat;
    divisions: Division[];
    poules: Poule[] = [];
    equipes: Equipe[] = [];
    
    constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private pouleService: PouleService,
        private clubService: ClubService
    ) {
        super();
        this.championnatCtrl = new FormControl();
    }


  ngOnInit() {
        this.refresh(null);
  }
  
    loadCalendar() {
        
        this.selectChampionnat.emit(this.selectedChampionnat);
//        
//        this.equipes = [];
//        this.poules=[];
//        if (this.selectedChampionnat) {
//            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
//                divisions => {
//                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
//                    this.divisions.forEach(division => {
//                        this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
//                            equipes.forEach(equipe => this.equipes.push(equipe));
//                        });
//                        this.pouleService.getPoules(division.id).subscribe(poules => {
//                            poules.forEach(poule => this.poules.push(poule));
//                        });
//                    });
//                }
//            );
//        }
    }
  
    refresh(championnat: Championnat) {
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
                this.selectedChampionnat = null;
            }
        });
    }
    
    getNbEquipesInChampionship() {
        return this.equipes.length;
    }
    
    getNbEquipesByDivision(division: Division) {
        return this.getEquipesByDivision(division).length;
    }
    
    getEquipesByDivision(division: Division) {
        return this.equipes.filter(equipe => equipe.division.id == division.id);
    }
    
    getEquipesByPoule(poule: Poule) {
        return this.equipes.filter(equipe => equipe.poule.id == poule.id);
    }
    
    getPoulesByDivision(division:Division) {
        return this.poules.filter(poule => poule.division.id == division.id);
    }
    
    getNbPoulesInDivision(division: Division) {
        return this.getPoulesByDivision(division).length;
    }

}
