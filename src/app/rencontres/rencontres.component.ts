import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Rencontre } from '../rencontre';
import {ChampionnatService} from '../championnat.service';
import {ClubService} from '../club.service';
import {DivisionService} from '../division.service';
import {PouleService} from '../poule.service';
import {EquipeService} from '../equipe.service';
import {RencontreService} from '../rencontre.service';
import {LocalStorageService} from '../local-storage.service';
import {AuthenticationService} from '../authentication.service';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {Championnat, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, getCategorieChampionnatCode} from '../championnat';
import {Division} from '../division';
import {Club} from '../club';
import {Equipe} from '../equipe';
import {Poule} from '../poule';
import {compare,getDate} from '../utility';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import {TerrainService} from '../terrain.service';
import {Terrain,HoraireTerrain} from '../terrain';

const RENCONTRES_VALIDES="Validées"
const RENCONTRES_A_VALIDER="A valider"
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

  date:Date=new Date();

  selectedChampionnat: Championnat;
  championnats: Championnat[];
  clubs:Club[];
  divisions: Division[]=[];
  selectedClub:Club;
  selectedDivision: Division;

  equipes:Equipe[]=[];
  selectedTeams:Equipe[]=[];

  poules:Poule[]=[];
  selectedPouleIds:number[]=[];

  typeRencontres:string[] = [RENCONTRES_VALIDES,RENCONTRES_A_VALIDER, RENCONTRES_A_ENCODER,RENCONTRES_A_VENIR, ALL_RENCONTRES];
  selectedTypeRencontre:string=ALL_RENCONTRES;

  rencontresAvecAlertes:Rencontre[]=[];
  sortedRencontres:Rencontre[]=[];
  filteredRencontres:Rencontre[];
  actualSort:Sort;
  selectedRencontre:Rencontre;
  
  alertView:boolean=false;
  divisionView:boolean=true;
  clubView:boolean=false;
  dateView:boolean=false;

  constructor(
        private route: ActivatedRoute,
        private championnatService: ChampionnatService,
        private clubService: ClubService,
        private divisionService: DivisionService,
        private pouleService: PouleService,
        private equipeService: EquipeService,
        private rencontreService: RencontreService,
        private authenticationService: AuthenticationService,
        private localStorageService:LocalStorageService,
        public dialog: MatDialog
        ) {
      super();
  }

  ngOnInit() {

    this.route.queryParams
      .filter(params => params.mode)
      .subscribe(params => {
        if (params.mode=='alertes') {
          this.alertView = true;
          this.divisionView = false;
          this.clubView = false;
          this.dateView = false;
          if (params.type=='a_encoder'){
            this.selectedTypeRencontre = RENCONTRES_A_ENCODER;
          }else if (params.type=='a_valider'){
            this.selectedTypeRencontre = RENCONTRES_A_VALIDER;
          }
        }
      });

      this.refreshAlertes();

      this.clubService.getClubs().subscribe(clubs => {
        this.clubs = clubs.sort((a,b) => compare(a.nom,b.nom,true));
        let clubInLocalStorage = this.localStorageService.getClubKey();
        if (clubInLocalStorage){
          this.selectedClub = this.clubs.find(club => club.id == JSON.parse(clubInLocalStorage).id);
        }
      });

      this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort((a, b) => compare(a.ordre, b.ordre, false));
            let championnatInLocalStorage = this.localStorageService.getChampionshipKey();
            if (championnatInLocalStorage) {
              this.selectedChampionnat = this.championnats.find(championnat => championnat.id == JSON.parse(championnatInLocalStorage).id);
              this.loadDivisions();
            }

      });
  }

  refreshAlertes(){
    if (this.authenticationService.isConnected()){
        this.rencontreService.getRencontresToComplete().subscribe(rencontres => {
          this.rencontresAvecAlertes = [];
          rencontres.forEach(rencontre => this.rencontresAvecAlertes.push(rencontre));
          this.rencontreService.getRencontresToValidate().subscribe(rencontres => {
            rencontres.forEach(rencontre => this.rencontresAvecAlertes.push(rencontre));
            if (this.alertView){
              this.loadRencontres();
            }
          });
        });
      }else{
        this.loadRencontres();
      }
  }

    changeToDivisionView(){
      if (!this.divisionView){
        this.divisionView=true;
        this.clubView=false;
        this.dateView=false;
        this.alertView = false;
        this.loadRencontres();
      }
    }

    changeToClubView(){
      if (!this.clubView){
        this.divisionView=false;
        this.clubView=true;
        this.dateView=false;
        this.alertView = false;
        this.loadRencontres();
      }
    }

    changeToDateView(){
      if (!this.dateView){
        this.divisionView=false;
        this.clubView=false;
        this.dateView=true;
        this.alertView = false;
        this.loadRencontres();
      }
    }

    changeToAlertView(){
        if (!this.alertView) {
          this.divisionView=false;
          this.clubView=false;
          this.dateView=false;
          this.alertView = true;
          this.refreshAlertes();
        }
    }

    getSelectedViewClass(selectedView){
      return selectedView?"selectedView":"";
    }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

    loadDivisions() {

        this.localStorageService.storeChampionshipKey(JSON.stringify(this.selectedChampionnat));

        this.sortedRencontres = [];
        this.filteredRencontres = [];
        this.divisions = [];
        this.poules = [];
        this.equipes = [];

        if (this.selectedChampionnat) {
            this.divisionService.getDivisions(this.selectedChampionnat.id).subscribe(
                divisions => {
                    this.divisions = divisions.sort((a, b) => {return compare(a.numero, b.numero, true)});

                  let divisionInLocalStorage = this.localStorageService.getChampionshipDivisionKey();
                  if (divisionInLocalStorage) {
                    this.selectedDivision = this.divisions.find(division => division.id == JSON.parse(divisionInLocalStorage).id);
                    this.loadRencontres();
                  }

                }
            );
        }
    }


    loadRencontres() {

      this.selectedTeams = [];
      this.selectedPouleIds = [];
      this.sortedRencontres = [];
      this.filteredRencontres = [];

        if (this.alertView) {

          this.sortedRencontres = this.rencontresAvecAlertes.sort((a, b) => compare(a.dateHeureRencontre, b.dateHeureRencontre,true));
          this.sortData(this.actualSort);

        } else if (this.divisionView){
            
            if (this.selectedDivision) {
              this.localStorageService.storeChampionshipDivisionKey(JSON.stringify(this.selectedDivision));

              this.pouleService.getPoules(this.selectedDivision.id).subscribe(poules => {
                  this.poules = poules.sort((a, b) => compare(a.numero,b.numero,true));
              });

              this.equipeService.getEquipes(this.selectedDivision.id,null).subscribe(equipes => {
                  this.equipes = equipes.sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique,true));
              });

              this.rencontreService.getRencontres(this.selectedDivision.id, null,null).subscribe(rencontresDivision => {
                  this.sortedRencontres = rencontresDivision.sort((a, b) => compare(a.dateHeureRencontre, b.dateHeureRencontre,true));
                  this.sortData(this.actualSort);
              });

            }
        } else if (this.clubView){

              if (this.selectedChampionnat && this.selectedClub) {
                this.localStorageService.storeClubKey(JSON.stringify(this.selectedClub));

                // Charger les equipes et les rencontres par corporation

                this.equipeService.getEquipesByClub(this.selectedChampionnat.id, this.selectedClub.id).subscribe(equipes => {
                    this.equipes = equipes.sort((a, b) => compare(a.codeAlphabetique, b.codeAlphabetique,true));
                });

                this.rencontreService.getRencontresByClub(this.selectedChampionnat.id, this.selectedClub.id).subscribe(rencontresClub => {
                    this.sortedRencontres = rencontresClub.sort((a, b) => compare(a.dateHeureRencontre, b.dateHeureRencontre,true));
                    this.sortData(this.actualSort);
                });

              }
        } else if (this.dateView){
            
            if (this.date){
                
                this.date = new Date(this.date);
                this.date.setHours(12);

                this.rencontreService.getRencontresByDate(this.date).subscribe(rencontresDivision => {
                      this.sortedRencontres = rencontresDivision.sort((a, b) => compare(a.dateHeureRencontre, b.dateHeureRencontre,true));
                      this.sortData(this.actualSort);
                  });
            }
        
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
            case 'dateHeureRencontre': return compare(getDate(a.dateHeureRencontre), getDate(b.dateHeureRencontre), isAsc);
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
                case 'court':
                {
                  let compareTerrain = 0;
                  if (a.terrain && !b.terrain){
                    return (isAsc ? -1 : 1);
                  }
                  if (!a.terrain && b.terrain){
                    return (isAsc ? 1 : -1);
                  }
                  if (a.terrain && b.terrain) {
                    compareTerrain = compare(a.terrain.nom, b.terrain.nom, isAsc);
                  }
                  if (compareTerrain!=0){
                    return compareTerrain;
                  }
                  if (a.court && !b.court){
                    return (isAsc ? -1 : 1);
                  }
                  if (!a.court && b.court){
                    return (isAsc ? 1 : -1);
                  }
                  if (a.court && b.court) {
                    return compare(a.court.code, b.court.code, isAsc);
                  }
                  return 0;
                }
              case 'categorie': return compare(this.getCategorieCode(a), this.getCategorieCode(b), isAsc);
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
             return !rencontre.valide && !rencontre.resultatsEncodes && rencontre.dateHeureRencontre!=null && getDate(rencontre.dateHeureRencontre) < new Date();
              });
       }else if (this.selectedTypeRencontre == RENCONTRES_A_VALIDER){
            this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
              return !rencontre.valide && rencontre.resultatsEncodes;
               });
        }else if (this.selectedTypeRencontre == RENCONTRES_A_VENIR){
           this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
             return !rencontre.valide && (rencontre.dateHeureRencontre==null || getDate(rencontre.dateHeureRencontre) >= new Date());
                });
       } else if (this.selectedTypeRencontre == RENCONTRES_VALIDES){
           this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
               return rencontre.valide;
                });
       }

        if (this.divisionView){
            if (this.selectedPouleIds  && this.selectedPouleIds.length > 0){
                 this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
                     return this.selectedPouleIds.some(selectedPouleId => {
                          // Interserie -> pouleId = 0
                         if (selectedPouleId==0){
                             return rencontre.poule==null;
                         }else{
                             return rencontre.poule!=null && rencontre.poule.id == selectedPouleId;
                         }
                     })});
             }
        }

        if (this.divisionView || this.clubView) {
            if (this.selectedTeams && this.selectedTeams.length > 0){
                 this.filteredRencontres = this.filteredRencontres.filter(rencontre => {
                     return this.selectedTeams.some(selectedTeam => {
                         return rencontre.equipeVisites.id==selectedTeam.id || rencontre.equipeVisiteurs.id==selectedTeam.id
                     })});
             }
        }

    }

    isInterseriesPossibles(){
        if (this.isAdminConnected()){
            if (this.selectedChampionnat){
                if (this.selectedChampionnat.type==TYPE_CHAMPIONNAT_ETE.code
                || this.selectedChampionnat.type==TYPE_CHAMPIONNAT_HIVER.code){
                    if (this.selectedChampionnat.calendrierValide && !this.selectedChampionnat.cloture){
                        if (this.poules!=null && this.poules.length>1){
                            return true;
                        }
                    }
                }
            }
        }
    }

    createInterserie(){

        if (this.isAdminConnected()){

            if (this.selectedChampionnat){

                let interserieDialogRef = this.dialog.open(InterserieDialog, {
                  data: { championnat: this.selectedChampionnat }, panelClass: "infosGeneralesMembreDialog", disableClose:true
                });

                interserieDialogRef.afterClosed().subscribe(rencontre => {
                    if (rencontre){
                        this.selectedRencontre = rencontre;
                        this.sortedRencontres.push(this.selectedRencontre);
                        this.sortData(this.actualSort);
                    }
                });

            }
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
        if (rencontre.pointsVisites!=null && rencontre.pointsVisiteurs!=null){
            if (rencontre.pointsVisites > rencontre.pointsVisiteurs){
                return "victorieux";
            }
        }
        return "";
    }

    getVisiteursClass(rencontre:Rencontre){
        if (rencontre.pointsVisites!=null && rencontre.pointsVisiteurs!=null){
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


  isDivisionCriterium(){
      if (this.selectedDivision){
        return this.selectedDivision.championnat.type==TYPE_CHAMPIONNAT_CRITERIUM.code;
      }
      return false;
  }

    isCriterium(rencontre:Rencontre):boolean{
      return rencontre.division.championnat.type==TYPE_CHAMPIONNAT_CRITERIUM.code;
    }

    getCategorieCode(rencontre:Rencontre):string{
        return getCategorieChampionnatCode(rencontre.division.championnat) + rencontre.division.pointsMaximum;
    }

}


@Component({
  selector: 'interserie-dialog',
  templateUrl: './interserieDialog.html',
  styleUrls: ['./interserieDialog.css']
})
export class InterserieDialog implements OnInit {

    rencontresInterseries:Rencontre[]=[];
    private _championnat:Championnat;

    calculInterseries:boolean=true;
    date:Date;
    heure:number;
    minute:number;
    terrainId:number;

    interserieSelected:Rencontre;

    terrains:Terrain[]=[];
    horairesTerrain:HoraireTerrain[]=[];

  constructor(
    public dialogRef: MatDialogRef<InterserieDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private rencontreService: RencontreService,
    private terrainService: TerrainService) {
        this._championnat = data.championnat;
    }

  ngOnInit() {
    this.rencontreService.getInterseries(this._championnat.id).subscribe(rencontres => {
        this.rencontresInterseries=rencontres;
        this.calculInterseries=false;
      }
    );
    this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains.filter(terrain => terrain.actif));
    this.terrainService.getHorairesTerrainByTypeChampionnat(this._championnat.type).subscribe(horaires => this.horairesTerrain = horaires);
  }

  switchTeams(rencontre:Rencontre){
    let oldEquipeVisites = rencontre.equipeVisites;
    rencontre.equipeVisites = rencontre.equipeVisiteurs;
    rencontre.equipeVisiteurs = oldEquipeVisites;
    //S'il s'agit d'un championnat ETE, on va switcher les terrains
    if (this._championnat.type==TYPE_CHAMPIONNAT_ETE.code){
      if (rencontre.equipeVisites.terrain){
          this.terrainId = rencontre.equipeVisites.terrain.id;
      }else{
          this.terrainId = null;
      }
    }
  }

    changeDate(){

      /*** Retrait du choix du terrain sur base de la date dans le championnat hiver car plusieurs terrains dispos le meme jour

      if (this._championnat.type==TYPE_CHAMPIONNAT_CRITERIUM.code){
        if (this.date!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => horaire.jourSemaine == (newDate.getDay()+1));
          if (horaire!=null){
            this.terrainId = horaire.terrain.id;
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }else
      */

      if (this._championnat.type==TYPE_CHAMPIONNAT_HIVER.code || this._championnat.type==TYPE_CHAMPIONNAT_ETE.code){
        if (this.date!=null && this.terrainId!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => (horaire.jourSemaine == (newDate.getDay()+1) && horaire.terrain.id == this.terrainId));
          if (horaire!=null){
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }
    }

    changeTerrain(){
      if (this._championnat.type==TYPE_CHAMPIONNAT_HIVER.code || this._championnat.type==TYPE_CHAMPIONNAT_ETE.code){
        if (this.date!=null && this.terrainId!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => (horaire.jourSemaine == (newDate.getDay()+1) && horaire.terrain.id == this.terrainId));
          if (horaire!=null){
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      if (this.interserieSelected){
          if (this.terrainId){
            let selectedTerrain = this.terrains.find(terrain => terrain.id == this.terrainId);
            this.interserieSelected.terrain = selectedTerrain;
        }else{
            this.interserieSelected.terrain=null;
        }

        if (this.date!=null && this.heure!=null && this.minute!=null){
            this.interserieSelected.dateHeureRencontre = new Date(this.date);
            this.interserieSelected.dateHeureRencontre.setHours(this.heure);
            this.interserieSelected.dateHeureRencontre.setMinutes(this.minute);
        }else{
            this.interserieSelected.dateHeureRencontre=null;
        }

        this.rencontreService.createRencontre(this.interserieSelected).subscribe(
            interserie => {
                this.interserieSelected.id=interserie.id;
                this.dialogRef.close(this.interserieSelected);
         });

      }

  }


}
