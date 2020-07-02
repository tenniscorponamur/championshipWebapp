import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import {Championnat} from '../championnat';
import {Division} from '../division';
import {Club} from '../club';
import {Equipe} from '../equipe';
import {compare} from '../utility';
import {MatDialog, Sort} from '@angular/material';
import {ChampionnatService} from '../championnat.service';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {LocalStorageService} from '../local-storage.service';
import {AuthenticationService} from '../authentication.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';

@Component({
  selector: 'app-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.css']
})
export class EquipesComponent extends ChampionnatDetailComponent implements OnInit {

    componentName:string="equipesComponent";
    @ViewChild("equipeDetail") equipeDetailComponent: ElementRef;
    @ViewChild("equipeList") equipeListComponent: ElementRef;

    championnats: Championnat[];
    selectedChampionnat: Championnat;
    selectedTeam:Equipe;
    addable:boolean=false;

    divisions:Division[]=[];
    equipes:Equipe[]=[];

    actualSort:Sort;
    sortedTeams:Equipe[]=[];

    showGraph=new Map();
    pieOptionsByDivision=new Map();
    pieChartLabelsByDivision=new Map();
    pieChartDataByDivision=new Map();

    // Pie
    public pieChartType:string = 'pie';
    public pieChartLabels:string[] = ['UCM', 'TCW', 'UNAMUR'];
    public pieChartData:number[] = [2,5,4];
    public pieChartOptions = {
         title : {
           display: true,
           text: "Division 1 (200 points)"
         },
         legend: {
             display: false
         }
    };

  constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private equipeService: EquipeService,
        private authenticationService: AuthenticationService,
        private localStorageService:LocalStorageService
        ) {
    super();
  }

  ngOnInit() {
      this.championnatService.getChampionnats().subscribe(championnats => {
          this.championnats = championnats.sort((a, b) => compare(a.ordre, b.ordre, false));
          let championnatInLocalStorage = this.localStorageService.getChampionshipKey();
          if (championnatInLocalStorage) {
            this.selectedChampionnat = this.championnats.find(championnat => championnat.id == JSON.parse(championnatInLocalStorage).id);
              this.loadChampionship();
          }
      });

  }

  loadChampionship(){
      if (this.selectedChampionnat) {
          this.localStorageService.storeChampionshipKey(JSON.stringify(this.selectedChampionnat));
          this.refreshAddable();
          this.refreshGraphs();
      }
      this.loadTeams(null);
  }

  refreshAddable(){
    this.addable = this.selectedChampionnat.autoriserResponsables && !this.selectedChampionnat.calendrierValide;
  }

  refreshGraphs(){
      this.showGraph=new Map();
      this.pieOptionsByDivision=new Map();
      this.pieChartLabelsByDivision=new Map();
      this.pieChartDataByDivision=new Map();

      this.divisions=[];
      this.equipes=[];
      this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
          divisions => {
              this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});
              this.divisions.forEach(division => {
                  this.pieChartLabelsByDivision[division.id]=[];
                  this.pieChartDataByDivision[division.id]=[];
                  let divisionTitle = "Division " + division.numero + " (" + division.pointsMaximum  + " points)";
                  this.pieOptionsByDivision[division.id] = {
                                                   title : {
                                                     display: true,
                                                     text: divisionTitle
                                                   },
                                                   legend: {
                                                       display: false
                                                   }
                                              };
                  this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
                      let clubs:Club[] = [];
                      equipes.forEach(equipe => {
                        this.equipes.push(equipe);
                        let clubDefined = clubs.find(club => club.id == equipe.club.id);
                        if (clubDefined==null){
                          clubs.push(equipe.club);
                        }
                      });
                      clubs.forEach(club => {
                        this.pieChartLabelsByDivision[division.id].push(club.nom);
                        let nbEquipes = equipes.filter(equipe => equipe.club.id == club.id).length;
                        this.pieChartDataByDivision[division.id].push(nbEquipes);
                      });
                      this.showGraph[division.id]=true;
                  });
              });
          }
      );
  }

  getNbEquipesByDivision(division:Division){
    return this.equipes.filter(equipe => equipe.division.id == division.id).length;
  }

  addTeam(division:Division){
    if (this.addable){
      // TODO : ajout et suppression uniquement possible lorsque l'administrateur en donne l'autorisation pour le championnat

      let newEquipe = new Equipe();
      newEquipe.club = this.getClub();
      newEquipe.division = division;
      this.equipeService.ajoutEquipe(division.id, newEquipe).subscribe(equipeSaved => {
              //Si equipe ajoutee, declenchement du renommage et refresh des graphes
              // Renommer equipes de ce club
              this.renommageEquipes(equipeSaved);
              this.refreshGraphs();
      });

    }

    //TODO : selectionner l'equipe dans l'ecran et basculer dessus si ecran mobile afin d'avoir le visuel adequat en rapport avec l'ajout effectue

  }

  getClub():Club{
      if (this.authenticationService.getConnectedUser()!=null){
        let user = this.authenticationService.getConnectedUser();
        if (user!=null && user.membre!=null && user.membre.club!=null){
          return user.membre.club;
        }
      }
  }

  loadTeams(equipeToSelect:Equipe){
    this.sortedTeams=[];
    this.selectedTeam=null;
    if (this.selectedChampionnat){
      let club = this.getClub();
      if (club) {
          this.equipeService.getEquipesByClub(this.selectedChampionnat.id, club.id).subscribe(equipes => {
            this.sortedTeams = equipes.sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique,true)); this.sortData(this.actualSort);
            if (equipeToSelect){
              this.selectedTeam = equipes.find(equipe => equipe.id == equipeToSelect.id);
            }
          });
      }
    }
  }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedTeams.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedTeams = data;
          return;
        }

        this.sortedTeams = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'division': return compare(a.division.numero, b.division.numero, isAsc);
            case 'equipe': return compare(a.codeAlphabetique, b.codeAlphabetique, isAsc);
            default: return 0;
          }
        });

    }
  }

    ouvrirEquipe(equipe:Equipe):void{
      this.selectedTeam=equipe;
    }

    ouvrirEquipeOnMobile(equipe:Equipe):void{
      this.selectedTeam=equipe;
      this.equipeDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }

    deleteEquipe(equipeToDelete:Equipe){
        this.equipeService.deleteEquipe(equipeToDelete).subscribe(result => {
            this.selectedTeam = null;

            let indexInSorted = this.sortedTeams.findIndex(equipe => equipe.id == equipeToDelete.id);
            if (indexInSorted!=-1){
                this.sortedTeams.splice(indexInSorted,1);
            }
            //Si equipe supprimee, declenchement du renommage et refresh des graphes
            // Renommer equipes de ce club
            this.renommageEquipes(null);
            this.refreshGraphs();

        });
    }


    renommageEquipes(equipeToSelect:Equipe) {
        let club = this.getClub();
        if (this.selectedChampionnat && club){
          this.equipeService.setAndUpdateEquipeNames(this.selectedChampionnat, club).subscribe(equipes => {
             this.loadTeams(equipeToSelect);
            }
          );
        }
    }

  public chartClicked(e:any):void {
    //console.log(e);
  }

  public chartHovered(e:any):void {
    //console.log(e);
  }

}
