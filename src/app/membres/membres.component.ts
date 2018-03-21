import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
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
export class MembresComponent implements OnInit {

clubCtrl: FormControl=new FormControl();

    filtreNomPrenom:string;
    membres:Membre[];
    componentName:string="membresComponent";
  memberListClass:string = "tennisCorpoBox col-sm-12 col-md-12 col-lg-6 col-xl-6";
  selectedMember:Membre;

  clubs:string[]=["UNAMUR","TC WALLONIE","IATA","GAZELEC"];

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

        this.membreService.searchMembres(nomPrenom).subscribe(membres => this.membres = membres);
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
    this.selectedMember=membre;
    //this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}
