import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat} from '../championnat';

@Component({
    selector: 'app-championnat-divisions',
    templateUrl: './championnat-divisions.component.html',
    styleUrls: ['./championnat-divisions.component.css']
})
export class ChampionnatDivisionsComponent implements OnInit {

    typeCtrl: FormControl = new FormControl();
    categorieCtrl: FormControl = new FormControl();
    type: string = "hiver";
    categories: string[] = ["messieurs", "dames", "mixte"];
    saison: number = new Date().getFullYear();
    selectedChampionnat: Championnat;

    constructor() {
        this.typeCtrl = new FormControl();
        this.categorieCtrl = new FormControl();
    }

    ngOnInit() {
    }

}
