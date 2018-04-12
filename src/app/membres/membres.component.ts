import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import {InfosGeneralesMembreDialog} from '../membre-detail/membre-detail.component';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import { RxResponsiveService } from 'rx-responsive';
import {ClubService} from '../club.service';
import {Club} from '../club';

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

  clubCtrl: FormControl=new FormControl();
  clubs:Observable<Club[]>;

    componentName:string="membresComponent";
    @ViewChild("membreDetail") membreDetailComponent: ElementRef;
    @ViewChild("membreList") membreListComponent: ElementRef;


    filtreNomPrenom:string;
    filtreSelectedClubs:Club[]=[];
    membres:Membre[];
    sortedMembers:Membre[];
    filteredMembers:Membre[];
    actualSort:Sort;
    selectedMember:Membre;

  constructor(public media: RxResponsiveService,
    private membreService:MembreService,
    private clubService:ClubService,
    public dialog: MatDialog) {
      this.clubCtrl = new FormControl();
      this.clubs = this.clubService.getClubs();
    }

  ngOnInit() {
      this.membreService.getMembres().subscribe(membres => {this.sortedMembers = membres; this.sortData(this.actualSort);});
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
            case 'dateNaissance': return compare(a.dateNaissance, b.dateNaissance, isAsc);
            default: return 0;
          }
        });
    }
    this.filtre(this.filtreNomPrenom,this.filtreSelectedClubs);
  }

    filtre(nomPrenom: string,selectedClubs:Club[]): void {
        console.log(selectedClubs);
        if (nomPrenom && nomPrenom.trim().length > 0){
            this.filteredMembers = this.sortedMembers.filter(membre =>
                membre.nom.toLowerCase().includes(nomPrenom.toLowerCase())
             || membre.prenom.toLowerCase().includes(nomPrenom.toLowerCase()))
        }else{
            this.filteredMembers = this.sortedMembers;
        }

//            this.players$ = this.searchTerms.pipe(
//              // wait 300ms after each keystroke before considering the term
//              debounceTime(300),
//
//              // ignore new term if same as previous term
//              distinctUntilChanged(),
//
//              // switch to new search observable each time the term changes
//              switchMap((term: string) => this.playerService.searchPlayers(term)),
//            );
        //this.membreService.searchMembres(nomPrenom).subscribe(membres => {this.membres = membres; this.sortedData = membres.slice();this.sortData(this.actualSort);});
    }

    nouveauMembre(){
        let nouveauMembre: Membre = new Membre();

        let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
            data: {membre: nouveauMembre }, panelClass: "infosGeneralesMembreDialog"
        });

        membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedMember = result;
                this.sortedMembers.push(this.selectedMember);
                this.sortData(this.actualSort);
            }
        });
        
        
    }

    ouvrirMembre(membre:Membre):void{
      let scrollPosition = "end";
      if (!this.selectedMember){
        scrollPosition = "start";
      }
      //TODO : getMembreById --> pour recuperer l'ensemble des informations du membre --> voir en fonction du role de l'utilisateur ??
      this.selectedMember=membre;
      //TODO : scroll only if mobile
      //this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: scrollPosition, inline: "nearest" });
    }

  
  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}

function compare(a, b, isAsc) {
    //TODO : voir comment comparer avec null
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
//
//export interface Element {
//  name: string;
//  position: number;
//  weight: number;
//  symbol: string;
//}
//
//const ELEMENT_DATA: Element[] = [
//  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
//  {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
//  {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
//  {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
//  {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
//  {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
//  {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
//  {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
//  {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
//  {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
//  {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
//];
//
