import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';

@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})
export class MembresComponent implements OnInit {

    filtreNomPrenom:string;
    membres:Membre[];
  memberListClass:string = "tennisCorpoBox col-sm-12 col-md-12 col-lg-6 col-xl-6";
  selectedMember:Membre;

  constructor(private membreService:MembreService) { }

  ngOnInit() {
      this.getMembres();
  }

    getMembres():void{
        this.membreService.getMembres().subscribe(membres => this.membres = membres);
    }

  ouvrirMembre(membre:Membre):void{
    this.selectedMember=membre;
  }

}
