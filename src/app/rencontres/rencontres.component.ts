import { Component, OnInit } from '@angular/core';
import { Rencontre } from '../rencontre';
import {FormControl} from '@angular/forms';
import {ChampionnatService} from '../championnat.service';
import {DivisionService} from '../division.service';
import {PouleService} from '../poule.service';
import {RencontreService} from '../rencontre.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {Championnat} from '../championnat';
import {Division} from '../division';
import {Club} from '../club';
import {compare} from '../utility';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import { RxResponsiveService } from 'rx-responsive';

@Component({
  selector: 'app-rencontres',
  templateUrl: './rencontres.component.html',
  styleUrls: ['./rencontres.component.css']
})
export class RencontresComponent extends ChampionnatDetailComponent implements OnInit {

  championnatCtrl: FormControl = new FormControl();
  divisionCtrl: FormControl = new FormControl();

  selectedChampionnat: Championnat;
  championnats: Championnat[];
  divisions: Division[];
  selectedDivision: Division;

  filtreSelectedClubs:Club[]=[];

  sortedRencontres:Rencontre[]=[];
  filteredRencontres:Rencontre[];
  actualSort:Sort;
  selectedRencontre:Rencontre;

  constructor(public media: RxResponsiveService,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private pouleService: PouleService,
        private rencontreService: RencontreService
        ) {
      super();
  }

  ngOnInit() {

      //TODO : localStorage pour conserver championnatEnCours -- cfr onglet championnat

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
        });
  }

    loadDivisions() {

    // TODO : charger divisions et poules dans une selectBox
    // TODO : si championnat et division/poule selectionnee --> chargement des rencontres (+ tri possible par date et par club)
    // TODO : filtre par club (sur donnees chargees) --> cfr filtre membres


        this.sortedRencontres = [];
        this.divisions = [];

        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
                }
            );
        }
    }


    loadRencontres() {
      // TODO : Charger dropDown poule et clubs
      // TODO : charger rencontres

      //TODO : tri par defaut par date

      //TODO : afficher matchs termines / matchs à venir

      this.sortedRencontres = [];

      if (this.selectedDivision) {
        this.rencontreService.getRencontres(this.selectedDivision.id, null).subscribe(rencontresDivision => {
            this.sortedRencontres = rencontresDivision;
            this.sortData(this.actualSort);
        });

        // this.clubs = this.clubService.getClubs();

      }


    }


  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedRencontres.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedRencontres = data;
          return;
        }

        this.sortedRencontres = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'dateHeureRencontre': return compare(a.dateHeureRencontre, b.dateHeureRencontre, isAsc);
            default: return 0;
          }
        });
    }
    this.filtre(this.filtreSelectedClubs);
  }

   filtre(selectedClubs:Club[]): void {

        this.filteredRencontres = this.sortedRencontres;

//        if (nomPrenom && nomPrenom.trim().length > 0){
//
//            this.filteredMembers = this.filteredMembers.filter(membre =>
//                membre.nom.toLowerCase().includes(nomPrenom.toLowerCase())
//             || membre.prenom.toLowerCase().includes(nomPrenom.toLowerCase()))
//
//        }
//        if (selectedClubs && selectedClubs.length > 0){
//            this.filteredRencontres = this.filteredRencontres.filter(({club}) => {
//                return selectedClubs.some(selectedClub => {
//                    if (club){
//                        return selectedClub.id==club.id
//                    }
//                    return false;
//                })});
//        }

    }

    ouvrirRencontre(rencontre:Rencontre):void{
      this.selectedRencontre=rencontre;
    }

}
