import { Component, OnInit } from '@angular/core';
import { MembreService } from '../membre.service';
import { ClubService } from '../club.service';
import { ChampionnatService } from '../championnat.service';
import { Membre } from '../membre';
import { Club } from '../club';
import { Championnat } from '../championnat';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import {compare} from '../utility';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private membres:Membre[]=[];
  private clubs:Club[]=[];

  membreSansClubsActifs:Membre[]=[];
  membreSansLocalite:Membre[]=[];
  membreSansClassement:Membre[]=[];
  nbClubsActifs:number=0;
  nbMembresActifs:number=0;
  nbDamesActives:number=0;
  nbMessieursActifs:number=0;
  nbMembresSansClubAFT:number=0;
  nbMembresSansLocalite:number=0;
  nbMembresSansClassement:number=0;
  chargementCompteursMembres:boolean=true;
  chargementCompteursClubs:boolean=true;

  private MAX_CHAMPIONNATS = 2;

  public showGraph:boolean=false;
  public lineChartData:Array<any> = [];
  public lineChartLabels:Array<any> = [];
  public lineChartType:string = 'bar';
  lineChartOptions = {
      scales: {
          yAxes: [{
                  display: true,
                  ticks: {
                      beginAtZero: true,
                      steps: 10,
                      stepValue: 5,
                      max: 100
                  }
              }]
      },
       title: {
           display: true,
           text: "Nombre d'équipes inscrites"
       }
  };

  constructor(private membreService:MembreService,
              private clubService:ClubService,
              private championnatService:ChampionnatService) { }

  ngOnInit() {
      this.membreService.getMembres(null).subscribe(membres => {this.membres=membres;this.initCompteursMembres();this.chargementCompteursMembres=false;});
      this.clubService.getClubs().subscribe(clubs => {this.clubs = clubs; this.initCompteurslubs();this.chargementCompteursClubs=false;});

      this.initTeamsChart();
  }

  initTeamsChart(){
      this.championnatService.getChampionnats().subscribe(championnats => {
        championnats.sort((a,b) => compare(a.id,b.id,false));

        let selectedChampionnats = [];
        for (var _i = 0; _i < Math.min(championnats.length,this.MAX_CHAMPIONNATS); _i++) {
            var championnat = championnats[_i];
            selectedChampionnats.push(championnat);
        }
        selectedChampionnats.reverse();
        selectedChampionnats.forEach(championnat => {
          this.loadTeams(championnat);
          this.showGraph = true;
        });

      });

  }

  loadTeams(championnat:Championnat){
      this.lineChartLabels = ['Eté 2018', 'Hiver 2018/2019', 'Eté 2019'];
      this.lineChartData.push({data:[34,25,35],label:'Dames'});
      this.lineChartData.push({data:[50,44,65],label:'Messieurs'});
  }

  initCompteursMembres(){
    this.membres.forEach(membre => {
        if (membre.actif){
          this.nbMembresActifs++;

          if (membre.genre == GENRE_FEMME.code){
            this.nbDamesActives++;
          }

          if (membre.genre == GENRE_HOMME.code){
            this.nbMessieursActifs++;
          }

          if (membre.numeroClubAft==null || membre.onlyCorpo==true){
            this.nbMembresSansClubAFT++;
            this.membreSansClubsActifs.push(membre);
          }

          if (membre.localite==null){
            this.nbMembresSansLocalite++;
            this.membreSansLocalite.push(membre);
          }

          if (membre.classementCorpoActuel==null){
            this.nbMembresSansClassement++;
            this.membreSansClassement.push(membre);
          }

        }
    });
  }

  initCompteurslubs(){
    this.clubs.forEach(club => {
        if (club.actif){
          this.nbClubsActifs++;
        }
    });
  }

  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

}
