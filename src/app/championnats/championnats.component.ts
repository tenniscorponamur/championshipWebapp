import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-championnats',
  templateUrl: './championnats.component.html',
  styleUrls: ['./championnats.component.css']
})
export class ChampionnatsComponent implements OnInit {

  typeCtrl: FormControl=new FormControl();
  categorieCtrl: FormControl=new FormControl();
  type:string="hiver";
  categories:string[]=["messieurs","dames","mixte"];
    saison: number = new Date().getFullYear();
  
  constructor() { 
      this.typeCtrl = new FormControl();
      this.categorieCtrl = new FormControl();
    }

  ngOnInit() {
  }

}
