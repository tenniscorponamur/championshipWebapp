import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
    componentName:string="membresComponent";
  memberListClass:string = "tennisCorpoBox col-sm-12 col-md-12 col-lg-6 col-xl-6";
  selectedMember:Membre;
  
  @ViewChild("membreDetail") membreDetailComponent: ElementRef;
  @ViewChild("membreList") membreListComponent: ElementRef;

  constructor(private membreService:MembreService) { }

  ngOnInit() {
      this.getMembres();
  }

    getMembres():void{
        this.membreService.getMembres().subscribe(membres => this.membres = membres);
    }

  ouvrirMembre(membre:Membre):void{
    this.selectedMember=membre;
    //this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  
  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}
