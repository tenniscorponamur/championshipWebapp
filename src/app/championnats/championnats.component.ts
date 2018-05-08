import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTabChangeEvent} from '@angular/material';
import {ChampionnatEquipesComponent} from '../championnat-equipes/championnat-equipes.component';
import {ChampionnatPoulesComponent} from '../championnat-poules/championnat-poules.component';
import {Championnat} from '../championnat';

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
  
  private selectedChampionnat:Championnat; 
  
  constructor() { 
    }

  ngOnInit() {
  }
    
  tabChanged(event:MatTabChangeEvent){
      if (event.index==1){
        this.championnatEquipesComponent.refresh(this.selectedChampionnat);
      }else if (event.index==2){
        this.championnatPoulesComponent.refresh(this.selectedChampionnat);
      }
  }

  selectChampionnat(championnat : Championnat){
      this.selectedChampionnat = championnat;
  }
  
}
