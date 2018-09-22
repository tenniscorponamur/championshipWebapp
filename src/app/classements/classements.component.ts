import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat} from '../championnat';
import {compare} from '../utility';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {ChampionnatService} from '../championnat.service';
import {ClassementService} from '../classement.service';
import {LocalStorageService} from '../local-storage.service';
import {Classement} from '../classement';
import {ClassementClub} from '../classementClub';

@Component({
  selector: 'app-classements',
  templateUrl: './classements.component.html',
  styleUrls: ['./classements.component.css']
})
export class ClassementsComponent extends ChampionnatDetailComponent implements OnInit {

  championnatCtrl: FormControl = new FormControl();

  championnats: Championnat[];

  selectedChampionnat: Championnat;

  classements:Classement[]=[];
  classementsClub:ClassementClub[]=[];

  showProgressPoules = false;
  showProgressClubs = false;

  constructor(private championnatService:ChampionnatService,
              private classementService:ClassementService,
              private localStorageService:LocalStorageService) {
    super();
  }

  ngOnInit() {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.championnats = championnats.sort(
                (a, b) => {
                    let comparaisonAnnee = compare(a.annee, b.annee, false);
                    if (comparaisonAnnee != 0) {
                        return comparaisonAnnee;
                    } else {
                        let comparaisonType = compare(a.type, b.type, true);
                        if (comparaisonType != 0) {
                            return comparaisonType;
                        } else {
                            return compare(a.categorie, b.categorie, true);
                        }
                    }
                });

              let championnatInLocalStorage = this.localStorageService.getChampionshipKey();
              if (championnatInLocalStorage) {
                this.selectedChampionnat = this.championnats.find(championnat => championnat.id == JSON.parse(championnatInLocalStorage).id);
                this.loadClassements();
              }
        });
    }
    
    
    loadClassements() {
        if (this.selectedChampionnat!=null){
            this.localStorageService.storeChampionshipKey(JSON.stringify(this.selectedChampionnat));
            this.loadClassementsPoules();
            this.loadClassementClubs();
        }
    }

    loadClassementsPoules() {
      this.showProgressPoules = true;
      if (this.selectedChampionnat!=null){
        this.classementService.getClassements(this.selectedChampionnat.id).subscribe(classements => {
          this.classements = classements;
          this.showProgressPoules = false;
        });
      }
    }
    
    loadClassementClubs(){
      this.showProgressClubs = true;
      if (this.selectedChampionnat!=null){
          this.classementService.getClassementsClub(this.selectedChampionnat.id).subscribe(classementsClub => {
              this.classementsClub = classementsClub;
              this.showProgressClubs=false;
          });
      }
    }
    
    getClassForClub(index:number){
      if (index==0){
        return "premier";
      }else{
        return "";
      }
    }

}
