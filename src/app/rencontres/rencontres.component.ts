import { Component, OnInit } from '@angular/core';
import { Rencontre } from '../rencontre';

@Component({
  selector: 'app-rencontres',
  templateUrl: './rencontres.component.html',
  styleUrls: ['./rencontres.component.css']
})
export class RencontresComponent implements OnInit {

  rencontres:Rencontre[]=[{'id':1,'date':'02/02/2018','clubA':'Test A','clubB':'Test B'}];
  selectedRencontre:Rencontre;

  constructor() { }

  ngOnInit() {
  }

}
