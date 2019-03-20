import { Component, OnInit } from '@angular/core';
import { MembreService } from '../membre.service';
import { ClubService } from '../club.service';
import { Membre } from '../membre';
import { Club } from '../club';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private membres:Membre[]=[];
  private clubs:Club[]=[];

  nbClubsActifs:number=0;
  nbMembresActifs:number=0;
  nbDamesActives:number=0;
  nbMessieursActifs:number=0;
  nbMembresSansClubAFT:number=0;
  nbMembresSansLocalite:number=0;
  nbMembresSansClassement:number=0;

  constructor(private membreService:MembreService, private clubService:ClubService) { }

  ngOnInit() {
      this.membreService.getMembres(null).subscribe(membres => {this.membres=membres;this.initCompteursMembres();});
      this.clubService.getClubs().subscribe(clubs => {this.clubs = clubs; this.initCompteurslubs();});
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
          }

          if (membre.localite==null){
            this.nbMembresSansLocalite++;
          }

          if (membre.classementCorpoActuel==null){
            this.nbMembresSansClassement++;
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
  
  // lineChart
  public lineChartData:Array<any> = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartType:string = 'line';
  public pieChartType:string = 'pie';
  public lineChartOptions = {};
 
  // Pie
  public pieChartLabels:string[] = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
  public pieChartData:number[] = [300, 500, 100];
 
  public randomizeType():void {
    this.lineChartType = this.lineChartType === 'line' ? 'bar' : 'line';
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }
 
  public chartClicked(e:any):void {
    console.log(e);
  }
 
  public chartHovered(e:any):void {
    console.log(e);
  }

}
