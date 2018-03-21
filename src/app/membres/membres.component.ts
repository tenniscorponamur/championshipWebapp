import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';
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

@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})
export class MembresComponent implements OnInit, AfterViewInit {

  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
      console.log("sort");
      this.dataSource.sort = this.sort;
  }

  clubCtrl: FormControl=new FormControl();

    filtreNomPrenom:string;
    membres:Membre[];
    componentName:string="membresComponent";
  memberListClass:string = "tennisCorpoBox col-sm-12 col-md-12 col-lg-6 col-xl-6";
  selectedMember:Membre;

  clubs:string[]=["UNAMUR","TC WALLONIE","IATA","GAZELEC"];

  sortedData;
  actualSort;

  filteredClubs:Observable<string[]>;

  @ViewChild("membreDetail") membreDetailComponent: ElementRef;
  @ViewChild("membreList") membreListComponent: ElementRef;

  constructor(public media: RxResponsiveService,
    private membreService:MembreService,
    public dialog: MatDialog) {
      this.clubCtrl = new FormControl();
      this.filteredClubs = this.clubCtrl.valueChanges
      .pipe(
        startWith(''),
          map(club => club ? this.filterClubs(club) : this.clubs.slice())
      );
    }

  ngOnInit() {
      this.getMembres();
      this.sortedData = this.membres.slice();
  }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.membres.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'nom': return compare(a.nom, b.nom, isAsc);
        case 'prenom': return compare(a.prenom, b.prenom, isAsc);
        default: return 0;
      }
    });
  }

  filterClubs(name: string) {
    return this.clubs.filter(club =>
      club.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

    filtre(nomPrenom: string): void {

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

        this.membreService.searchMembres(nomPrenom).subscribe(membres => {this.membres = membres; this.sortData(this.actualSort);});
    }

    getMembres():void{
        this.membreService.getMembres().subscribe(membres => this.membres = membres);
    }

    nouveauMembre(){
        let nouveauMembre: Membre = new Membre();

        let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
            data: {membre: nouveauMembre }, panelClass: "infosGeneralesMembreDialog"
        });

        membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedMember = result;
            }
        });
    }

  ouvrirMembre(membre:Membre):void{
    let scrollPosition = "end";
    if (!this.selectedMember){
      scrollPosition = "start";
    }
    this.selectedMember=membre;
    this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: scrollPosition, inline: "nearest" });
  }

  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: Element[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  {position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na'},
  {position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg'},
  {position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al'},
  {position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si'},
  {position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P'},
  {position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S'},
  {position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl'},
  {position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar'},
  {position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K'},
  {position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca'},
];

