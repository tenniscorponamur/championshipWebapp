import { Component, OnInit, Input } from '@angular/core';
import { Membre } from '../membre';

@Component({
  selector: 'app-membre-detail',
  templateUrl: './membre-detail.component.html',
  styleUrls: ['./membre-detail.component.css']
})
export class MembreDetailComponent implements OnInit {

  @Input() membre: Membre;
  
  constructor() { }

  ngOnInit() {
  }

}
