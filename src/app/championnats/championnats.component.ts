import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material';
import {ChampionnatEquipesComponent} from '../championnat-equipes/championnat-equipes.component';
import {ChampionnatPoulesComponent} from '../championnat-poules/championnat-poules.component';
import {Championnat} from '../championnat';
import {ChampionnatRencontresComponent} from '../championnat-rencontres/championnat-rencontres.component';

const TENNIS_CORPO_CHAMPIONSHIP_KEY = "tennisCorpoChampionship";
const TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY = "tennisCorpoChampionshipIndex";

@Component({
    selector: 'app-championnats',
    templateUrl: './championnats.component.html',
    styleUrls: ['./championnats.component.css']
})
export class ChampionnatsComponent implements OnInit {

    @ViewChild(ChampionnatEquipesComponent)
    private championnatEquipesComponent: ChampionnatEquipesComponent;

    @ViewChild(ChampionnatPoulesComponent)
    private championnatPoulesComponent: ChampionnatPoulesComponent;

    @ViewChild(ChampionnatRencontresComponent)
    private championnatRencontresComponent: ChampionnatRencontresComponent;

    private selectedChampionnat: Championnat;
    private selectedIndex: number;

    constructor() {
    }

    ngOnInit() {

        let championnatInLocalStorage = localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_KEY);
        if (championnatInLocalStorage) {

            this.selectedChampionnat = JSON.parse(championnatInLocalStorage);

            let championnatIndexInLocalStorage = localStorage.getItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY);
            if (championnatIndexInLocalStorage) {
                this.selectedIndex = JSON.parse(championnatIndexInLocalStorage);
                this.refreshTab();
            }

        }

    }

    tabChanged(event: MatTabChangeEvent) {

        localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_INDEX_KEY, JSON.stringify(event.index));
        this.selectedIndex = event.index;
        this.refreshTab();

    }

    refreshTab() {

        if (this.selectedIndex == 1) {
            this.championnatEquipesComponent.refresh(this.selectedChampionnat,true);
        } else if (this.selectedIndex == 2) {
            this.championnatPoulesComponent.refresh(this.selectedChampionnat,true);
        } else if (this.selectedIndex == 3) {
            this.championnatRencontresComponent.refresh(this.selectedChampionnat,true);
        }
    }


    selectChampionnat(championnat: Championnat) {
        this.selectedChampionnat = championnat;
        localStorage.setItem(TENNIS_CORPO_CHAMPIONSHIP_KEY, JSON.stringify(championnat));
    }

}
