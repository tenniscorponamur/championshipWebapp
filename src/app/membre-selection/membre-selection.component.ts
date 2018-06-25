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
    membres:Membre[]=[];
    filteredMembres:Membre[]=[];
    filtreNomPrenom:string;

  constructor(public dialogRef: MatDialogRef<MembreSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService:MembreService) {
        this.club = data.club;
      }

  ngOnInit() {
      this.membreService.getMembres(this.club.id).subscribe(membres => {this.membres = membres; this.filtre();});
  }

  filtre(){
      // TODO : filtrer sur la liste des membres du club --> actif / genre / capitaine /...

      this.filteredMembres = this.membres;

      // On ne va consirer que les membres actifs

      this.filteredMembres = this.filteredMembres.filter(membre => membre.actif);

      if (this.filtreNomPrenom && this.filtreNomPrenom.trim().length > 0){
        this.filteredMembres = this.filteredMembres.filter(membre => {
                return membre.nom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
             || membre.prenom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
        });

      }
  }

    select(membre:Membre){
        this.dialogRef.close(membre);
    }

    fermerSelection(){
       this.dialogRef.close();
    }

}
