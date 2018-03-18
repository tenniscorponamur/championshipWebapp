import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {InfosGeneralesMembreDialog} from '../membre-detail/membre-detail.component';

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

  constructor(private membreService:MembreService,
    public dialog: MatDialog) { }

  ngOnInit() {
      this.getMembres();
  }

    getMembres():void{
        this.membreService.getMembres().subscribe(membres => this.membres = membres);
    }
    
    nouveauMembre(){
        let nouveauMembre: Membre = new Membre();
        
        let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
            data: {membre: nouveauMembre }, panelClass: "infosGeneralesMembreDialog"
        });

        membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedMember = result;
            }
        });
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
