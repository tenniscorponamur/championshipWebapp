import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat, TYPES_CHAMPIONNAT, TYPE_CHAMPIONNAT_HIVER, TypeChampionnat, TYPE_CHAMPIONNAT_ETE, CATEGORIES_CHAMPIONNAT, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_MIXTES} from '../championnat';
import {RxResponsiveService} from 'rx-responsive';
import {MatDialog} from '@angular/material';

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
    saison: number;
    
    
    selectedChampionnat: Championnat;

    constructor(
    public media: RxResponsiveService,
    public dialog: MatDialog) {
        this.typeCtrl = new FormControl();
        this.categorieCtrl = new FormControl();
        
        this.saison = new Date().getFullYear();
        this.selectedType = TYPE_CHAMPIONNAT_ETE;
        this.selectedCategories = [CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES];
    }

    ngOnInit() {
    }

}
