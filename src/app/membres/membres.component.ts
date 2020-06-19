import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';
import {AuthenticationService} from '../authentication.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import {InfosGeneralesMembreDialog} from '../membre-detail/membre-detail.component';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {ClubService} from '../club.service';
import {Club} from '../club';
import {compare} from '../utility';
import { saveAs } from 'file-saver';
import {Genre, GENRES} from '../genre';
import {ClassementCorpo} from '../classementCorpo';
import {ClassementMembreService} from '../classement-membre.service';

@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})
export class MembresComponent implements OnInit, AfterViewInit {

//  applyFilter(filterValue: string) {
//    filterValue = filterValue.trim(); // Remove whitespace
//    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
//    this.dataSource.filter = filterValue;
//  }
//  @ViewChild(MatSort) sort: MatSort;
//
  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
//      console.log("sort");
//      this.dataSource.sort = this.sort;
  }

  clubs:Club[];
  genres:Genre[];
  echellesCorpo:any[]=[];
  preparationExportMembres:boolean=false;

    componentName:string="membresComponent";
    @ViewChild("membreDetail") membreDetailComponent: ElementRef;
    @ViewChild("membreList") membreListComponent: ElementRef;

    filtreNomPrenom:string;
    filtreSelectedClubs:Club[]=[];

    filtreEchellecorpo:number;
    filtreNumeroClubAFT:string;
    filtreSelectedGenre:Genre;
    filtreActivite:string;

    membres:Membre[];
    sortedMembers:Membre[];
    filteredMembers:Membre[];
    actualSort:Sort;
    selectedMember:Membre;

    chargementMembres:boolean=true;

  constructor(
    private route: ActivatedRoute,
    private membreService:MembreService,
    private clubService:ClubService,
    private authenticationService: AuthenticationService,
    private classementMembreService: ClassementMembreService,
    public dialog: MatDialog) {
      this.genres = GENRES;
    }

  ngOnInit() {
      this.clubService.getClubs().subscribe(clubs => this.clubs = clubs.sort((a, b) => compare(a.nom, b.nom,true)));
      this.classementMembreService.getEchellesCorpo().subscribe(echellesCorpo => this.echellesCorpo = echellesCorpo);
      this.membreService.getMembres(null).subscribe(membres => {this.chargementMembres=false;this.sortedMembers = membres; this.sortData(this.actualSort); this.selectMemberFromParam();});
  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  isResponsableClubConnected(){
    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.responsableClub==true){
            return true;
        }
      }
    }
    return false;
  }

  exportMembresByResponsableClub(){
    let user = this.authenticationService.getConnectedUser();
      if (this.isResponsableClubConnected()){
        if (user.membre.club!=null){
            this.preparationExportMembres = true;
            this.membreService.getExportMembresByClub(user.membre.club).subscribe(result => {
                this.preparationExportMembres = false;
                saveAs(result, "membres_club_" + user.membre.club.nom + ".xlsx");
            //var fileURL = URL.createObjectURL(result);window.open(fileURL);
          },error => {console.log(error);});
        }
      }
  }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedMembers.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedMembers = data;
          return;
        }

        this.sortedMembers = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'nom': return compare(a.nom, b.nom, isAsc);
            case 'prenom': return compare(a.prenom, b.prenom, isAsc);
            //case 'club': return compare(a.club.nom, b.club.nom, isAsc);
            case 'pointsCorpo': {
              let pointsA = (a.classementCorpoActuel!=null)?a.classementCorpoActuel.points:null;
              let pointsB = (b.classementCorpoActuel!=null)?b.classementCorpoActuel.points:null;
              return compare(pointsA, pointsB, isAsc);
            }
            default: return 0;
          }
        });
    }
    this.filtre();
  }

  selectMemberFromParam(){
    this.route.queryParams
      .filter(params => params.memberId)
      .subscribe(params => {
        if (params.memberId!=null) {
          console.log(params.memberId);
          this.selectedMember = this.filteredMembers.find(membre => membre.id == params.memberId);
        }
      });
  }

    isOtherCriterias(){
    return (this.filtreSelectedGenre != null && this.filtreSelectedGenre != undefined)
        || (this.filtreActivite != null && this.filtreActivite != undefined)
        || (this.filtreEchellecorpo != null && this.filtreEchellecorpo != undefined)
        || (this.filtreNumeroClubAFT != null && this.filtreNumeroClubAFT != undefined && this.filtreNumeroClubAFT.trim()!='');
    }

    filtre(): void {

        this.filteredMembers = this.sortedMembers;

        if (this.filtreNomPrenom && this.filtreNomPrenom.trim().length > 0){

            this.filteredMembers = this.filteredMembers.filter(membre =>
                membre.nom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
             || membre.prenom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase()));

        }
        if (this.filtreSelectedClubs && this.filtreSelectedClubs.length > 0){
            this.filteredMembers = this.filteredMembers.filter(({club}) => {
                // Workaround car je ne parviens pas a faire en sorte que la methode includes retourne true
                return this.filtreSelectedClubs.some(selectedClub => {
                    if (club){
                        return selectedClub.id==club.id
                    }
                    return false;
                })});
        }

        if (this.filtreSelectedGenre != null && this.filtreSelectedGenre != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => membre.genre == this.filtreSelectedGenre.code);
        }

        if (this.filtreActivite != null && this.filtreActivite != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (this.filtreActivite=="true"){
                    return membre.actif;
                }else{
                    return !membre.actif;
                }
            });
        }

        if (this.filtreEchellecorpo != null && this.filtreEchellecorpo != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (membre.classementCorpoActuel != null){
                    return membre.classementCorpoActuel.points == this.filtreEchellecorpo;
                }
                return false;
            });
        }

        if (this.filtreNumeroClubAFT != null && this.filtreNumeroClubAFT != undefined && this.filtreNumeroClubAFT.trim().length > 0){

            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (membre.numeroClubAft!=null){
                    return membre.numeroClubAft.toLowerCase().includes(this.filtreNumeroClubAFT.toLowerCase());
                }
            });

        }

    }

    nouveauMembre(){
        let nouveauMembre: Membre = new Membre();

        let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
            data: {membre: nouveauMembre }, panelClass: "infosGeneralesMembreDialog", disableClose:true
        });

        membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedMember = result;
                this.sortedMembers.push(this.selectedMember);
                this.sortData(this.actualSort);
            }
        });


    }

    styleMembre(membre:Membre){
        if (!membre.actif){
            return "membreInactif";
        }else{
            return "";
        }
    }

    ouvrirMembre(membre:Membre):void{
      this.selectedMember=membre;
    }

    ouvrirMembreOnMobile(membre:Membre):void{
      this.selectedMember=membre;
      this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }

    deleteMembre(membreToDelete:Membre){
        this.membreService.deleteMembre(membreToDelete).subscribe(result => {
            this.selectedMember = null;

            let indexInFiltered = this.filteredMembers.findIndex(membre => membre.id == membreToDelete.id);
            if (indexInFiltered!=-1){
                this.filteredMembers.splice(indexInFiltered,1);
            }
            let indexInSorted = this.sortedMembers.findIndex(membre => membre.id == membreToDelete.id);
            if (indexInSorted!=-1){
                this.sortedMembers.splice(indexInSorted,1);
            }

        });
    }

  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }


    importer(){

        let importMembresDialogRef = this.dialog.open(ImportMembresDialog, {
            data: {}, panelClass: "importMembresDialog", disableClose:false
        });

    }


}


@Component({
  selector: 'import-membres-dialog',
  templateUrl: './importMembresDialog.html',
})
export class ImportMembresDialog {

    showWorkInProgress:boolean=false;
    showFinished:boolean=false;

  constructor(
    public dialogRef: MatDialogRef<ImportMembresDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService) {
    }

  getTemplate(){
    this.membreService.getTemplateImportMembres().subscribe(result => {
      saveAs(result, "template.xls");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

  importData(event:any) {
    let reader = new FileReader();
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.showFinished=false;
          this.showWorkInProgress=true;
          let content = (<string> reader.result).split(',')[1];
          this.membreService.importData(content).subscribe(result => {
            this.showWorkInProgress=false;
            this.showFinished=true;
          });
        };
      }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}

