import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import {Championnat} from '../championnat';
import {Equipe} from '../equipe';
import {compare} from '../utility';
import {MatDialog, Sort} from '@angular/material';
import {ChampionnatService} from '../championnat.service';
import {LocalStorageService} from '../local-storage.service';
import {AuthenticationService} from '../authentication.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';

@Component({
  selector: 'app-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.css']
})
export class EquipesComponent extends ChampionnatDetailComponent implements OnInit {

    @Output() selectChampionnat = new EventEmitter<Championnat>();
    championnats: Championnat[];
    selectedChampionnat: Championnat;
    equipes:Equipe[]=[];

    // Pie
    public pieChartType:string = 'pie';
    public pieChartLabels:string[] = ['UCM', 'TCW', 'UNAMUR'];
    public pieChartData:number[] = [2,5,4];

  constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
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
      this.refreshGraphs();
      this.loadTeams();
  }

  refreshGraphs(){
    console.log("show graphs");
    this.pieChartData = [2,5,4];
  }

  loadTeams(){
    console.log("chargement des equipes de ma corporation pour le championnat selectionne");
  }

  public chartClicked(e:any):void {
    //console.log(e);
  }

  public chartHovered(e:any):void {
    //console.log(e);
  }

}
