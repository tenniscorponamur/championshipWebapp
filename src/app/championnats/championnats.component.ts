import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTabChangeEvent} from '@angular/material';
import {ChampionnatEquipesComponent} from '../championnat-equipes/championnat-equipes.component';

@Component({
  selector: 'app-championnats',
  templateUrl: './championnats.component.html',
  styleUrls: ['./championnats.component.css']
})
export class ChampionnatsComponent implements OnInit {
    
  @ViewChild(ChampionnatEquipesComponent)
  private championnatEquipesComponent: ChampionnatEquipesComponent;
  
  constructor() { 
    }

  ngOnInit() {
  }
    
  tabChanged(event:MatTabChangeEvent){
      console.log("refresh childs : " + event.index);
      this.championnatEquipesComponent.refresh();
  }

}
