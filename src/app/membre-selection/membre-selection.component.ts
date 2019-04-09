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
    private membresARetirer:Membre[]=[];

    triAlpha:boolean=true;
    triNumeric:boolean=false;
    anyMemberPossible:boolean=false;
    chargementMembres:boolean=true;
    membresSelectionnables:Membre[]=[];
    membres:Membre[]=[];
    filteredMembres:Membre[]=[];
    filtreNomPrenom:string;
    filtreGenre:string;
    deselectionPossible:boolean=false;

  constructor(public dialogRef: MatDialogRef<MembreSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService:MembreService,
    private classementMembreService:ClassementMembreService) {
        this.membresSelectionnables = data.membresSelectionnables;
        this.club = data.club;
        this.anyMemberPossible=data.anyMemberPossible;
        this.membresARetirer=data.membresARetirer;
        this.capitaine = data.capitaine;
        this.filtreGenre = data.genre;
        this.championnatHomme = data.championnatHomme;
        this.deselectionPossible = data.deselectionPossible;

        if (data.triParPoints){
          this.triNumeric=true;
          this.triAlpha=false;
        }
      }

  ngOnInit() {
      let clubId = null;
      if (this.club){
        clubId = this.club.id;
      }
      this.classementMembreService.correspondanceEchelleCorpo().subscribe(mapEquivalence => this.mapEquivalence = mapEquivalence);
      if (this.membresSelectionnables){
        this.loadMembers(this.membresSelectionnables);
      }else{
        this.membreService.getMembres(clubId).subscribe(membres => this.loadMembers(membres));
      }
  }

  loadMembers(membres:Membre[]){
    this.membres = membres;
    this.filtre();
    this.chargementMembres=false;
  }

  selectAll(){
      this.membres=[];
      this.filteredMembres=[];
      this.chargementMembres=true;
      this.membreService.getMembres(null).subscribe(membres => {this.membres = membres; this.filtre();this.chargementMembres=false;});
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

      if (this.membresARetirer){
        this.filteredMembres = this.filteredMembres.filter(membre => {
          let membreToRemove = this.membresARetirer.find(membreARetirer => membreARetirer.id == membre.id);
          return membreToRemove == null;
        });
      }

      this.sort();

  }

  sort(){
    if (this.triAlpha){
        this.filteredMembres = this.filteredMembres.sort((a,b) => compare(a.nom,b.nom,true));
    }
    if (this.triNumeric){
        this.filteredMembres = this.filteredMembres.sort((a,b) => {
          let pointsA = (a.classementCorpoActuel!=null)?a.classementCorpoActuel.points:null;
          let pointsB = (b.classementCorpoActuel!=null)?b.classementCorpoActuel.points:null;
          return compare(pointsA, pointsB, false);
          }
        );
    }
  }

  triParNom(){
    this.triAlpha=true;
    this.triNumeric=false;
    this.sort();
  }

  triParPoints(){
    this.triAlpha=false;
    this.triNumeric=true;
    this.sort();
  }

    select(membre:Membre){
        this.dialogRef.close(membre);
    }

    unselect(){
        this.dialogRef.close(null);
    }

    fermerSelection(){
       this.dialogRef.close();
    }

}
