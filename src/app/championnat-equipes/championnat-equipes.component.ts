import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {ClubService} from '../club.service';
import {Club} from '../club';

@Component({
  selector: 'app-championnat-equipes',
  templateUrl: './championnat-equipes.component.html',
  styleUrls: ['./championnat-equipes.component.css']
})
export class ChampionnatEquipesComponent implements OnInit {

    clubs=[
    {nom:"UNAMUR",equipe:1,selected:false},
    {nom:"BNP FORTIS",equipe:0,selected:true},
    {nom:"TC WALLONIE",equipe:2,selected:false},
    {nom:"IATA",equipe:0,selected:false},
    {nom:"GAZELEC",equipe:1,selected:false},
    {nom:"RAIL",equipe:0,selected:false},
    {nom:"POLICE NAMUR",equipe:0,selected:false},
    ]
  fichier:File;

  constructor(
    public dialog: MatDialog
    ) { }

  ngOnInit() {
  }


  loadFile(){
      console.log("load file " + this.fichier);
  }  
  
  onChange(event) {
    var files:FileList = event.target.files;
    this.fichier = files.item(0);
    var fileReader:FileReader=new FileReader();
    //atob(this.fichier);
    fileReader.onloadend = function(e){
      // you can perform an action with readed data here
      console.log(fileReader.result);
    }

      fileReader.readAsBinaryString(this.fichier);
  }
  
  displayTeam(data:any):boolean{
      return data.equipe>0||data.selected;
  }
  
  removeOneTeam(data:any){
      if (data.equipe>0){
        data.equipe--;
      }
  }
  
  addOneTeam(data:any){
      data.equipe++;
  }
  
    selectionClubs() {
      let clubDialogRef = this.dialog.open(SelectionClubDialog, {
        data: {  }, panelClass: "selectionClubDialog", disableClose:false
      });

      clubDialogRef.afterClosed().subscribe(result => {
           console.log("selection des clubs termines")
      });
  }
}


@Component({
  selector: 'selection-club-dialog',
  templateUrl: './selectionClubDialog.html',
})
export class SelectionClubDialog {

    private clubs:Club[];

  constructor(
    public dialogRef: MatDialogRef<SelectionClubDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clubService: ClubService) {

        this.clubService.getClubs().subscribe(clubs => {this.clubs = clubs;});

    }
}
