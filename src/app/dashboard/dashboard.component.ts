import { Component, Inject, OnInit } from '@angular/core';
import { MembreService } from '../membre.service';
import { ClubService } from '../club.service';
import { ChampionnatService } from '../championnat.service';
import { Membre } from '../membre';
import { Club } from '../club';
import { Championnat, CategorieChampionnat, getTypeChampionnat, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES } from '../championnat';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import {DivisionService} from '../division.service';
import {EquipeService} from '../equipe.service';
import {compare} from '../utility';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private membres:Membre[]=[];
  private clubs:Club[]=[];

  membresInactifs:Membre[]=[];
  membresSansClubsActifs:Membre[]=[];
  membresAffiliesCorpo:Membre[]=[];
  membresSansLocalite:Membre[]=[];
  membresSansClassement:Membre[]=[];
  nbClubsActifs:number=0;
  nbClubsInactifs:number=0;
  nbMembresActifs:number=0;
  nbMembresInactifs:number=0;
  nbDamesActives:number=0;
  nbMessieursActifs:number=0;
  nbMembresSansClubAFT:number=0;
  nbMembresAffiliesCorpo:number=0;
  nbMembresSansLocalite:number=0;
  nbMembresSansClassement:number=0;
  chargementCompteursMembres:boolean=true;
  chargementCompteursClubs:boolean=true;

  private MAX_CHAMPIONNATS = 4;

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
                      max: 60
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
              private divisionService: DivisionService,
              private equipeService: EquipeService,
              private championnatService:ChampionnatService,
              public dialog: MatDialog) { }

  ngOnInit() {
      this.membreService.getMembres(null).subscribe(membres => {this.membres=membres.sort((a,b) => compare(a.nom,b.nom,true));this.initCompteursMembres();this.chargementCompteursMembres=false;});
      this.clubService.getClubs().subscribe(clubs => {this.clubs = clubs; this.initCompteurslubs();this.chargementCompteursClubs=false;});

      this.initTeamsChart();
  }

  initTeamsChart(){
      this.championnatService.getChampionnats().subscribe(championnats => {

        championnats = championnats.filter(championnat => championnat.type == TYPE_CHAMPIONNAT_HIVER.code || championnat.type == TYPE_CHAMPIONNAT_ETE.code);

        championnats.sort((a,b) => compare(a.id,b.id,false));

        for (var _i = 0; _i < Math.min(championnats.length,this.MAX_CHAMPIONNATS); _i++) {
            var championnat = championnats[_i];
            this.selectedChampionnats.push(championnat);
        }
        this.selectedChampionnats.reverse();

        this.selectedChampionnats.forEach(championnat => {
          let periode = this.lineChartLabels.find(periode => periode == (getTypeChampionnat(championnat).libelle + " " + championnat.annee));
          if (periode==null){
            this.lineChartLabels.push((getTypeChampionnat(championnat).libelle + " " + championnat.annee));
          }
        });

        this.selectedChampionnats.forEach(championnat => {
          this.loadTeams(championnat);
        });

      });

  }

  private selectedChampionnats:Championnat[] = [];
  private teamsInChampionnat=new Map();

  loadTeams(championnat:Championnat){
      this.divisionService.getDivisions(championnat.id).subscribe(
          divisions => {
              divisions.forEach(division => {
                  this.equipeService.getEquipes(division.id, null).subscribe(equipes => {
                      let nbEquipes = this.teamsInChampionnat.get(championnat.id);
                      if (nbEquipes==null){
                        nbEquipes = 0;
                      }
                      this.teamsInChampionnat.set(championnat.id, nbEquipes + equipes.length);
                      this.updateTeamGraph();
                  });
              });
          }
      );

      //this.lineChartLabels = ['Eté 2018', 'Hiver 2018/2019', 'Eté 2019'];
      //this.lineChartData.push({data:[34,25,35],label:'Dames'});
      //this.lineChartData.push({data:[50,44,65],label:'Messieurs'});
  }

  updateTeamGraph(){
      this.lineChartData = [];

      // Dames
      this.lineChartData.push({data:this.loadData(CATEGORIE_CHAMPIONNAT_DAMES),label:'Dames'});

      // Messieurs
      this.lineChartData.push({data:this.loadData(CATEGORIE_CHAMPIONNAT_MESSIEURS),label:'Messieurs'});

      this.showGraph = true;
  }

  loadData(categorieChampionnat : CategorieChampionnat):number[]{
      let data = [];
      this.lineChartLabels.forEach(chartLabel => {
        let selectedChampionnat = this.selectedChampionnats.find(championnat => (getTypeChampionnat(championnat).libelle + " " + championnat.annee == chartLabel) && (championnat.categorie == categorieChampionnat.code));
        if (selectedChampionnat!=null){
          let nbEquipes = this.teamsInChampionnat.get(selectedChampionnat.id);
          if (nbEquipes!=null){
            data.push(nbEquipes);
          }else{
            data.push(0);
          }
        }else{
          data.push(0);
        }
      });
      return data;
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
            this.membresSansClubsActifs.push(membre);
          }

          if (membre.onlyCorpo){
            this.nbMembresAffiliesCorpo++;
            this.membresAffiliesCorpo.push(membre);
          }

          if (membre.localite==null){
            this.nbMembresSansLocalite++;
            this.membresSansLocalite.push(membre);
          }

          if (membre.classementCorpoActuel==null){
            this.nbMembresSansClassement++;
            this.membresSansClassement.push(membre);
          }

        }else{
          this.nbMembresInactifs++;
          this.membresInactifs.push(membre);
        }
    });
  }

  initCompteurslubs(){
    this.clubs.forEach(club => {
        if (club.actif){
          this.nbClubsActifs++;
        }else{
          this.nbClubsInactifs++;
        }
    });
  }

  public chartClicked(e:any):void {
    //console.log(e);
  }
 
  public chartHovered(e:any):void {
    //console.log(e);
  }

  openMembres(membres:Membre[]){
      if (membres.length>0){
        let membreListingDialogRef = this.dialog.open(MembreListingDialog, {
          data: { membres: membres }, panelClass: "membreListingDialog", disableClose:false
        });
      }
  }

}


@Component({
  selector: 'membre-listing-dialog',
  templateUrl: './membreListingDialog.html',
  styleUrls: ['./membreListingDialog.css']
})
export class MembreListingDialog implements OnInit {

  membres:Membre[]=[];

  constructor(
    public dialogRef: MatDialogRef<MembreListingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.membres = data.membres;
    }


  ngOnInit() {
  }

    fermerSelection(){
       this.dialogRef.close();
    }

  openMembre(membre:Membre){
    window.open("./#/membres?memberId=" +membre.id);
    //this.router.navigate(['/membres'], {queryParams : {memberId : membre.id} });
  }

}
