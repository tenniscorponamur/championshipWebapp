import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Rencontre } from '../rencontre';
import {FormControl} from '@angular/forms';
import {ChampionnatService} from '../championnat.service';
import {DivisionService} from '../division.service';
import {PouleService} from '../poule.service';
import {EquipeService} from '../equipe.service';
import {RencontreService} from '../rencontre.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {Championnat, TENNIS_CORPO_CHAMPIONSHIP_KEY} from '../championnat';
import {Division, TENNIS_CORPO_CHAMPIONSHIP_DIVISION_KEY} from '../division';
import {Club} from '../club';
import {Equipe} from '../equipe';
import {Poule} from '../poule';
import {compare,addLeadingZero} from '../utility';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import { RxResponsiveService } from 'rx-responsive';

const RENCONTRES_VALIDES="Valides"
const RENCONTRES_A_ENCODER="A encoder"
const RENCONTRES_A_VENIR="A venir"
const ALL_RENCONTRES="Toutes"

@Component({
  selector: 'app-rencontres',
  templateUrl: './rencontres.component.html',
  styleUrls: ['./rencontres.component.css']
})
export class RencontresComponent extends ChampionnatDetailComponent implements OnInit {

  @ViewChild("rencontreDetail") rencontreDetailComponent: ElementRef;

  championnatCtrl: FormControl = new FormControl();
  divisionCtrl: FormControl = new FormControl();
  pouleCtrl: FormControl = new FormControl();
  teamCtrl: FormControl = new FormControl();

  selectedChampionnat: Championnat;
  championnats: Championnat[];
  divisions: Division[]=[];
  selectedDivision: Division;

  equipes:Equipe[]=[];
  selectedTeams:Equipe[]=[];

  poules:Poule[]=[];
  selectedPouleIds:number[]=[];

  typeRencontres:string[] = [RENCONTRES_VALIDES,RENCONTRES_A_ENCODER,RENCONTRES_A_VENIR, ALL_RENCONTRES];
  selectedTypeRencontre:string=RENCONTRES_A_ENCODER;

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

      this.selectedTeams = [];
      this.selectedPouleIds = [];

      this.pouleService.getPoules(this.selectedDivision.id).subscribe(poules => {
          this.poules = poules.sort((a, b) => compare(a.numero,b.numero,true));
      });
      this.equipeService.getEquipes(this.selectedDivision.id,null).subscribe(equipes => {
          this.equipes = equipes.sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique,true));
      });

      this.sortedRencontres = [];

      if (this.selectedDivision) {
        this.rencontreService.getRencontres(this.selectedDivision.id, null).subscribe(rencontresDivision => {
            this.sortedRencontres = rencontresDivision.sort((a, b) => compare(a.dateHeureRencontre, b.dateHeureRencontre,true));
            this.sortData(this.actualSort);
        });

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
            case 'terrain':
                {
                  if (a.terrain && !b.terrain){
                    return (isAsc ? -1 : 1);
                  }
                  if (!a.terrain && b.terrain){
                    return (isAsc ? 1 : -1);
                  }
                  if (a.terrain && b.terrain) {
                    return compare(a.terrain.nom, b.terrain.nom, isAsc);
                  }
                  return 0;
                }
//              case 'poule': return  compare(this.formatPoule(a), this.formatPoule(b), isAsc);
              case 'equipeVisites': return compare(a.equipeVisites.codeAlphabetique, b.equipeVisites.codeAlphabetique, isAsc);
              case 'equipeVisiteurs': return compare(a.equipeVisiteurs.codeAlphabetique, b.equipeVisiteurs.codeAlphabetique, isAsc);
            default: return 0;
          }
        });
    }
    this.filtre();
  }

   filtre(): void {

        this.filteredRencontres = this.sortedRencontres;

       if (this.selectedTypeRencontre == RENCONTRES_A_ENCODER){
           this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
             return !rencontre.valide && rencontre.dateHeureRencontre!=null && rencontre.dateHeureRencontre < new Date();
              });
       } else if (this.selectedTypeRencontre == RENCONTRES_A_VENIR){
           this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
             return !rencontre.valide && (rencontre.dateHeureRencontre==null || rencontre.dateHeureRencontre >= new Date());
                });
       } else if (this.selectedTypeRencontre == RENCONTRES_VALIDES){
           this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
               return rencontre.valide;
                });
       }

       if (this.selectedPouleIds  && this.selectedPouleIds.length > 0){
            this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
                return this.selectedPouleIds.some(selectedPouleId => {
                    if (selectedPouleId==0){
                        return rencontre.poule==null;
                    }else{
                        return rencontre.poule.id == selectedPouleId;
                    }
                })});
        }

       if (this.selectedTeams && this.selectedTeams.length > 0){
            this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
                return this.selectedTeams.some(selectedTeam => {
                    return rencontre.equipeVisites.id==selectedTeam.id || rencontre.equipeVisiteurs.id==selectedTeam.id
                })});
        }

    }

    ouvrirRencontre(rencontre:Rencontre):void{
      this.selectedRencontre=rencontre;
    }

    ouvrirRencontreOnMobile(rencontre:Rencontre):void{
      this.selectedRencontre=rencontre;
      this.rencontreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }

    getVisitesClass(rencontre:Rencontre){
        if (rencontre.pointsVisites && rencontre.pointsVisiteurs){
            if (rencontre.pointsVisites > rencontre.pointsVisiteurs){
                return "victorieux";
            }
        }
        return "";
    }

    getVisiteursClass(rencontre:Rencontre){
        if (rencontre.pointsVisites && rencontre.pointsVisiteurs){
            if (rencontre.pointsVisites < rencontre.pointsVisiteurs){
                return "victorieux";
            }
        }
        return "";
    }

//    formatPoule(rencontre:Rencontre):string{
//        if (rencontre.poule){
//            return "Poule " + rencontre.poule.numero.toString();
//        }else{
//            return "Interséries";
//        }
//    }

    formatDate(date:Date):string{
        if (date){
            let dateToFormat=new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth()+1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        }else{
            return "";
        }
    }

}
