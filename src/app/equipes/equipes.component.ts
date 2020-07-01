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

    @Output() selectChampionnat = new EventEmitter<Championnat>();
    championnats: Championnat[];
    selectedChampionnat: Championnat;
    selectedTeam:Equipe;

    divisions:Division[]=[];
    equipes:Equipe[]=[];

    mesEquipes:Equipe[]=[];

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
      this.selectChampionnat.emit(this.selectedChampionnat);

      if (this.selectedChampionnat) {
          this.refreshGraphs();
      }
      this.loadTeams();
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
    console.log("ajout d'une equipe dans une division");

    //TODO : nouvelle equipe -> selection capitaine et terrain par defaut (division fixee par le bouton utilise)

    //TODO : lors de l'ajout ou suppression d'une equipe --> refreshGraphs et refreshTeams car renommage necessaire

  }

  loadTeams(){
    this.mesEquipes=[];
    this.selectedTeam=null;
    if (this.selectedChampionnat){
      if (this.authenticationService.getConnectedUser()!=null){
        let user = this.authenticationService.getConnectedUser();
        if (user!=null && user.membre!=null && user.membre.club!=null){
          this.equipeService.getEquipesByClub(this.selectedChampionnat.id, user.membre.club.id).subscribe(equipes => this.mesEquipes = equipes);
        }
      }
    }
  }


  sortData(sort: Sort) {
  //TODO : sort table equipes (voir clubs)
  }

    ouvrirEquipe(equipe:Equipe):void{
      this.selectedTeam=equipe;
    }

    ouvrirEquipeOnMobile(equipe:Equipe):void{
      this.selectedTeam=equipe;
      this.equipeDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }

    deleteEquipe(equipeToDelete:Equipe){
        //TODO : suppression de l'equipe, renommage eventuel (cfr admin) et refresh des graphes
        /*
        this.clubService.deleteClub(clubToDelete).subscribe(result => {
            this.selectedClub = null;

            let indexInSorted = this.sortedClubs.findIndex(club => club.id == clubToDelete.id);
            if (indexInSorted!=-1){
                this.sortedClubs.splice(indexInSorted,1);
            }

        });
        */
    }

  public chartClicked(e:any):void {
    //console.log(e);
  }

  public chartHovered(e:any):void {
    //console.log(e);
  }

}
