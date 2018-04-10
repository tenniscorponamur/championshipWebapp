import { Component, OnInit, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, Sort} from '@angular/material';
import { RxResponsiveService } from 'rx-responsive';
import {Club} from '../club';
import {ClubService} from '../club.service';
import {ClubDialog} from '../club-detail/club-detail.component';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {

  actualSort:Sort;
  sortedClubs:Club[];
  selectedClub:Club;

  constructor(public media: RxResponsiveService,
    private clubService:ClubService,
    public dialog: MatDialog) { }


  ngOnInit() {
      this.clubService.getClubs().subscribe(clubs => {this.sortedClubs = clubs; this.sortData(this.actualSort);});
  }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedClubs.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedClubs = data;
          return;
        }

        this.sortedClubs = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'numero': return compare(a.numero, b.numero, isAsc);
            case 'nom': return compare(a.nom, b.nom, isAsc);
            default: return 0;
          }
        });

    }
  }


    nouveauClub(){
        let nouveauClub: Club = new Club();

        let clubDialogRef = this.dialog.open(ClubDialog, {
            data: { club: nouveauClub }, panelClass: "clubDialog"
        });

        clubDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedClub = result;
                this.sortedClubs.push(this.selectedClub);
                this.sortData(this.actualSort);
            }
        });
    }

}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
