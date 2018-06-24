import { Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Membre} from '../membre';
import {MembreService} from '../membre.service';
import {Club} from '../club';

@Component({
  selector: 'app-membre-selection',
  templateUrl: './membre-selection.component.html',
  styleUrls: ['./membre-selection.component.css']
})
export class MembreSelectionComponent implements OnInit {

    private club:Club;
    membres:Membre[];

  constructor(public dialogRef: MatDialogRef<MembreSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService:MembreService) {
        this.club = data.club;
      }

  ngOnInit() {
      // TODO : filtrer sur la liste des membres du club --> actif / genre / capitaine /... 
      this.membreService.getMembres(this.club.id).subscribe(membres => this.membres = membres);
  }

    select(membre:Membre){
        this.dialogRef.close(membre);
    }

}
