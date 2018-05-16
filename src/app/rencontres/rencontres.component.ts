import { Component, OnInit } from '@angular/core';
import { Rencontre } from '../rencontre';

@Component({
  selector: 'app-rencontres',
  templateUrl: './rencontres.component.html',
  styleUrls: ['./rencontres.component.css']
})
export class RencontresComponent implements OnInit {

  rencontres:Rencontre[]=[];
  selectedRencontre:Rencontre;

  constructor() { }

  ngOnInit() {
  }

}
