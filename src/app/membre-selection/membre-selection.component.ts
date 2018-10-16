import { Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Membre} from '../membre';
import {MembreService} from '../membre.service';
import {ClassementMembreService} from '../classement-membre.service';
import {Club} from '../club';
import {compare} from '../utility';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';

@Component({
  selector: 'app-membre-selection',
  templateUrl: './membre-selection.component.html',
  styleUrls: ['./membre-selection.component.css']
})
export class MembreSelectionComponent implements OnInit {

    genres = GENRES;

    private club:Club;
    private capitaine: Boolean;
    private championnatHomme:Boolean;
    private mapEquivalence;

    chargementMembres:boolean=true;
    membres:Membre[]=[];
    filteredMembres:Membre[]=[];
    filtreNomPrenom:string;
    filtreGenre:string;

  constructor(public dialogRef: MatDialogRef<MembreSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService:MembreService,
    private classementMembreService:ClassementMembreService) {
        this.club = data.club;
        this.capitaine = data.capitaine;
        this.filtreGenre = data.genre;
        this.championnatHomme = data.championnatHomme;
      }

  ngOnInit() {
      let clubId = null;
      if (this.club){
        clubId = this.club.id;
      }
      this.membreService.getMembres(clubId).subscribe(membres => {this.membres = membres; this.filtre();this.chargementMembres=false;});
      this.classementMembreService.correspondanceEchelleCorpo().subscribe(mapEquivalence => this.mapEquivalence = mapEquivalence);
  }

  showEquivalence(membre:Membre):boolean{
    if (this.mapEquivalence){
      if (this.championnatHomme==true){
        if (membre) {
            if (membre.genre == GENRE_FEMME.code){
              return true;
            }
        }
      }
    }
    return false;
  }

  equivalencePoints(membre:Membre):number{
    if (this.mapEquivalence){
      if (membre.classementCorpoActuel){
        return this.mapEquivalence[membre.classementCorpoActuel.points];
      }
    }
    return null;
  }

  filtre(){

      this.filteredMembres = this.membres;

      // On ne va consirer que les membres actifs

      this.filteredMembres = this.filteredMembres.filter(membre => membre.actif);

      // Si le parametre capitaine est passe, on va filtrer selon sa valeur

      if (this.capitaine!=null){
        this.filteredMembres = this.filteredMembres.filter(membre => membre.capitaine==this.capitaine);
      }

      if (this.filtreNomPrenom && this.filtreNomPrenom.trim().length > 0){
        this.filteredMembres = this.filteredMembres.filter(membre => {
                return membre.nom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
             || membre.prenom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
        });
      }

      if (this.filtreGenre!=null){
            this.filteredMembres = this.filteredMembres.filter(membre => {
                      return membre.genre==this.filtreGenre
              });
      }

      this.filteredMembres = this.filteredMembres.sort((a,b) => compare(a.nom,b.nom,true));

  }

    select(membre:Membre){
        this.dialogRef.close(membre);
    }

    fermerSelection(){
       this.dialogRef.close();
    }

}
