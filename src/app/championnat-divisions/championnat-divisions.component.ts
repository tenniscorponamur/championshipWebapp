import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat, TYPES_CHAMPIONNAT, TYPE_CHAMPIONNAT_HIVER, TypeChampionnat, TYPE_CHAMPIONNAT_ETE, CATEGORIES_CHAMPIONNAT, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES, getCategorieChampionnat , getTypeChampionnat} from '../championnat';
import {RxResponsiveService} from 'rx-responsive';
import {MatDialog, Sort} from '@angular/material';
import {ChampionnatService} from '../championnat.service';
import {compare} from '../utility';

@Component({
    selector: 'app-championnat-divisions',
    templateUrl: './championnat-divisions.component.html',
    styleUrls: ['./championnat-divisions.component.css']
})
export class ChampionnatDivisionsComponent implements OnInit {

    typeCtrl: FormControl = new FormControl();
    categorieCtrl: FormControl = new FormControl();
    
    types = TYPES_CHAMPIONNAT;
    categories = CATEGORIES_CHAMPIONNAT;
    
    selectedType: TypeChampionnat;
    selectedCategories: CategorieChampionnat[];
    annee: number;
    
    actualSort:Sort;
    
    sortedChampionnats:Championnat[];
    filteredChampionnats:Championnat[];
    
    selectedChampionnat: Championnat;
    
    constructor(
    public media: RxResponsiveService,
    public dialog: MatDialog,
    private championnatService:ChampionnatService) {
        this.typeCtrl = new FormControl();
        this.categorieCtrl = new FormControl();
        
        this.annee = new Date().getFullYear();
        this.selectedType = TYPE_CHAMPIONNAT_ETE;
        this.selectedCategories = [CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES];
    }

    ngOnInit() {
      this.championnatService.getChampionnats().subscribe(championnats => {this.sortedChampionnats = championnats; this.sortData(this.actualSort);});
    }
    
    getTypeChampionnat(championnat:Championnat):TypeChampionnat{
        return getTypeChampionnat(championnat);
    }
    
    getCatetorieChampionnat(championnat:Championnat):CategorieChampionnat{
        return getCategorieChampionnat(championnat);
    }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedChampionnats.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedChampionnats = data;
          return;
        }

        this.sortedChampionnats = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'annee': return compare(a.annee, b.annee, isAsc);
            case 'type': return compare(a.type, b.type, isAsc);
            case 'categorie': return compare(a.categorie, b.categorie, isAsc);
            default: return 0;
          }
        });
    }
    this.filtre(this.annee,this.selectedType,this.selectedCategories);
  }
  
    filtre(annee: number,selectedType:TypeChampionnat,selectedCategories:CategorieChampionnat[]): void {
        
        this.filteredChampionnats = this.sortedChampionnats;
            
        if (annee){
            
            this.filteredChampionnats = this.filteredChampionnats.filter(championnat =>
                championnat.annee == annee)
             
        }
        
        if (selectedType){
            this.filteredChampionnats = this.filteredChampionnats.filter(({type}) => {
                return selectedType.code==type});
        }
        
        if (selectedCategories && selectedCategories.length > 0){
            this.filteredChampionnats = this.filteredChampionnats.filter(({categorie}) => {
                
                // Workaround car je ne parviens pas a faire en sorte que la methode includes retourne true
                return selectedCategories.some(selectedCategorie => {
                    if (categorie){
                        return selectedCategorie.code==categorie;
                    }
                    return false;
                })});
        }

    }
    
    //TODO : filtre, sort, getChamp
    //TODO : getChampByID pour selected

}
