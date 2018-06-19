import { Component, OnInit } from '@angular/core';
import { Rencontre } from '../rencontre';
import {FormControl} from '@angular/forms';
import {ChampionnatService} from '../championnat.service';
import {DivisionService} from '../division.service';
import {PouleService} from '../poule.service';
import {EquipeService} from '../equipe.service';
import {RencontreService} from '../rencontre.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {Championnat} from '../championnat';
import {Division} from '../division';
import {Club} from '../club';
import {Equipe} from '../equipe';
import {Poule} from '../poule';
import {compare,addLeadingZero} from '../utility';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import { RxResponsiveService } from 'rx-responsive';

const TENNIS_CORPO_CHAMPIONSHIP_KEY = "tennisCorpoChampionship";
const TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY = "tennisCorpoChampionshipDivision";

@Component({
  selector: 'app-rencontres',
  templateUrl: './rencontres.component.html',
  styleUrls: ['./rencontres.component.css']
})
export class RencontresComponent extends ChampionnatDetailComponent implements OnInit {

  championnatCtrl: FormControl = new FormControl();
  divisionCtrl: FormControl = new FormControl();
  pouleCtrl: FormControl = new FormControl();
  teamCtrl: FormControl = new FormControl();

  selectedChampionnat: Championnat;
  championnats: Championnat[];
  divisions: Division[]=[];
  selectedDivision: Division;

  equipes:Equipe[]=[];
  filtreSelectedTeams:Equipe[]=[];

  poules:Poule[]=[];
  selectedPoule:Poule;

  typeRencontres:string[] = ["Résultats connus","A venir", "Toutes"];
  selectedTypeRencontre:string="A venir";

  sortedRencontres:Rencontre[]=[];
  filteredRencontres:Rencontre[];
  actualSort:Sort;
  selectedRencontre:Rencontre;

  constructor(public media: RxResponsiveService,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private pouleService: PouleService,
        private equipeService: EquipeService,
        private rencontreService: RencontreService
        ) {
      super();
  }

  ngOnInit() {

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

              let championnatInLocalStorage = localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_KEY);
              if (championnatInLocalStorage) {
                this.selectedChampionnat = this.championnats.find(championnat => championnat.id == JSON.parse(championnatInLocalStorage).id);
                this.loadDivisions();
              }

        });
  }

    loadDivisions() {

        localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_KEY, JSON.stringify(this.selectedChampionnat));

        this.sortedRencontres = [];
        this.divisions = [];

        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});

                  let divisionInLocalStorage = localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY);
                  if (divisionInLocalStorage) {
                    this.selectedDivision = this.divisions.find(division => division.id == JSON.parse(divisionInLocalStorage).id);
                    this.loadRencontres();
                  }

                }
            );
        }
    }


    loadRencontres() {

        localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY, JSON.stringify(this.selectedDivision));

      // TODO : Charger dropDown poule et equipes
      // TODO : charger rencontres

      //TODO : tri par defaut par date

      //TODO : afficher matchs termines / matchs à venir

      this.pouleService.getPoules(this.selectedDivision.id).subscribe(poules => this.poules = poules);
      this.equipeService.getEquipes(this.selectedDivision.id,null).subscribe(equipes => this.equipes = equipes);

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
    this.filtre();
  }

   filtre(): void {

    console.log(this.selectedPoule);
    console.log(this.filtreSelectedTeams);
    console.log(this.selectedTypeRencontre);

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

    formatDate(date:Date):string{
        let dateToFormat=new Date(date);
        return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth()+1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
    }

}
