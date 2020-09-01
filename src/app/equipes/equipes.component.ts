import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import {Championnat, TYPE_CHAMPIONNAT_CRITERIUM} from '../championnat';
import {Division} from '../division';
import {Club} from '../club';
import {Equipe} from '../equipe';
import {compare} from '../utility';
import {MatDialog, Sort} from '@angular/material';
import {ChampionnatService} from '../championnat.service';
import {DivisionService} from '../division.service';
import {ClubService} from '../club.service';
import {EquipeService} from '../equipe.service';
import {LocalStorageService} from '../local-storage.service';
import {AuthenticationService} from '../authentication.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-equipes',
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.css']
})
export class EquipesComponent extends ChampionnatDetailComponent implements OnInit {

    componentName:string="equipesComponent";
    @ViewChild("equipeDetail") equipeDetailComponent: ElementRef;
    @ViewChild("equipeList") equipeListComponent: ElementRef;

    championnats: Championnat[]=[];
    clubs:Club[]=[];
    selectedChampionnat: Championnat;
    selectedTeam:Equipe;
    addable:boolean=false;
    selectedClub:Club;

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

    preparationListe:boolean=false;

  constructor(
        public dialog: MatDialog,
        private championnatService: ChampionnatService,
        private divisionService: DivisionService,
        private clubService: ClubService,
        private equipeService: EquipeService,
        private authenticationService: AuthenticationService,
        private localStorageService:LocalStorageService
        ) {
    super();
  }

  ngOnInit() {

      this.clubService.getClubs().subscribe(clubs => {
        this.clubs = clubs.sort((a, b) => compare(a.nom, b.nom,true));
        if (this.isAdminConnected()){
            let clubInLocalStorage = this.localStorageService.getClubKey();
            if (clubInLocalStorage) {
              this.selectedClub = this.clubs.find(club => club.id == JSON.parse(clubInLocalStorage).id);
          }
        }
      });

      this.championnatService.getChampionnats().subscribe(championnats => {
          this.championnats = championnats.sort((a, b) => compare(a.ordre, b.ordre, false));
          let championnatInLocalStorage = this.localStorageService.getChampionshipKey();
          if (championnatInLocalStorage) {
            this.selectedChampionnat = this.championnats.find(championnat => championnat.id == JSON.parse(championnatInLocalStorage).id);
              this.loadChampionship();
          }
      });

  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  changeClub(){
    if (this.isAdminConnected()){
      this.localStorageService.storeClubKey(JSON.stringify(this.selectedClub));
      this.loadTeams(null);
    }
  }

  loadChampionship(){
      if (this.selectedChampionnat) {
          this.localStorageService.storeChampionshipKey(JSON.stringify(this.selectedChampionnat));
          this.refreshAddable();
          this.refreshGraphs();
          this.loadTeams(null);
      }
  }

    isCriterium(){
      if (this.selectedChampionnat) {
        return this.selectedChampionnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code;
      }
      return false;
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
      // Ajout et suppression uniquement possible lorsque l'administrateur en donne l'autorisation pour le championnat
      let club = this.getClub();
      if (club){
        let newEquipe = new Equipe();
        newEquipe.club = club;
        newEquipe.division = division;
        this.equipeService.ajoutEquipe(division.id, newEquipe).subscribe(equipeSaved => {
                //Si equipe ajoutee, declenchement du renommage et refresh des graphes
                // Renommer equipes de ce club
                this.renommageEquipes(equipeSaved);
                this.refreshGraphs();
        });
      }
    }

    //TODO : selectionner l'equipe dans l'ecran et basculer dessus si ecran mobile afin d'avoir le visuel adequat en rapport avec l'ajout effectue

  }

  getClub():Club{
    if (this.isAdminConnected()){
      return this.selectedClub;
    }else{
      if (this.authenticationService.getConnectedUser()!=null){
        let user = this.authenticationService.getConnectedUser();
        if (user!=null && user.membre!=null && user.membre.club!=null){
          return user.membre.club;
        }
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

    updatedDivisionEquipe(updatedEquipe:Equipe){
        this.refreshGraphs();
        this.loadTeams(updatedEquipe);
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


  getListeCapitaines(){
    if (this.selectedChampionnat){
      this.preparationListe=true;
      this.championnatService.getListeCapitaines(this.selectedChampionnat).subscribe(result => {
          this.preparationListe = false;
          saveAs(result, "capitaines.pdf");
      },error => {console.log(error);});
    }
  }

  getListeEquipes(){
   if (this.isAdminConnected()){
      if (this.selectedChampionnat){
        this.preparationListe=true;
        this.championnatService.getListeEquipes(this.selectedChampionnat).subscribe(result => {
            this.preparationListe = false;
            saveAs(result, "equipes.pdf");
        },error => {console.log(error);});
      }
    }
  }

  public chartClicked(e:any):void {
    //console.log(e);
  }

  public chartHovered(e:any):void {
    //console.log(e);
  }

}
