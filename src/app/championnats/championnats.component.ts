import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material';
import {ChampionnatDivisionsComponent} from '../championnat-divisions/championnat-divisions.component';
import {ChampionnatEquipesComponent} from '../championnat-equipes/championnat-equipes.component';
import {ChampionnatPoulesComponent} from '../championnat-poules/championnat-poules.component';
import {Championnat} from '../championnat';
import {ChampionnatRencontresComponent} from '../championnat-rencontres/championnat-rencontres.component';
import {LocalStorageService} from '../local-storage.service';

@Component({
    selector: 'app-championnats',
    templateUrl: './championnats.component.html',
    styleUrls: ['./championnats.component.css']
})
export class ChampionnatsComponent implements OnInit {

    @ViewChild(ChampionnatDivisionsComponent)
    private championnatDivisionsComponent: ChampionnatDivisionsComponent;

    @ViewChild(ChampionnatEquipesComponent)
    private championnatEquipesComponent: ChampionnatEquipesComponent;

    @ViewChild(ChampionnatPoulesComponent)
    private championnatPoulesComponent: ChampionnatPoulesComponent;

    @ViewChild(ChampionnatRencontresComponent)
    private championnatRencontresComponent: ChampionnatRencontresComponent;

    private selectedChampionnat: Championnat;
    selectedIndex: number;

    constructor(private localStorageService:LocalStorageService) {
    }

    ngOnInit() {

        let championnatInLocalStorage = this.localStorageService.getChampionshipKey();
        if (championnatInLocalStorage) {

            this.selectedChampionnat = JSON.parse(championnatInLocalStorage);

            let championnatIndexInLocalStorage = this.localStorageService.getChampionshipIndexKey();
            if (championnatIndexInLocalStorage) {
                this.selectedIndex = JSON.parse(championnatIndexInLocalStorage);
                this.refreshTab();
            }

        }

    }

    tabChanged(event: MatTabChangeEvent) {
        this.localStorageService.storeChampionshipIndexKey(JSON.stringify(event.index));
        this.selectedIndex = event.index;
        this.refreshTab();

    }

    refreshTab() {
        if (this.selectedIndex == 0) {
            this.championnatDivisionsComponent.refresh(this.selectedChampionnat,true);
         }else if (this.selectedIndex == 1) {
            this.championnatEquipesComponent.refresh(this.selectedChampionnat,true);
        } else if (this.selectedIndex == 2) {
            this.championnatPoulesComponent.refresh(this.selectedChampionnat,true);
        } else if (this.selectedIndex == 3) {
            this.championnatRencontresComponent.refresh(this.selectedChampionnat,true);
        }
    }


    selectChampionnat(championnat: Championnat) {
        this.selectedChampionnat = championnat;
        this.localStorageService.storeChampionshipKey(JSON.stringify(championnat));
    }

}
