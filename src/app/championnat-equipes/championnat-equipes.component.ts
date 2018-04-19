import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-championnat-equipes',
  templateUrl: './championnat-equipes.component.html',
  styleUrls: ['./championnat-equipes.component.css']
})
export class ChampionnatEquipesComponent implements OnInit {

    clubs:string[]=["UNAMUR","TC WALLONIE","IATA","GAZELEC","RAIL","VIVAQUA","POLICE NAMUR"]
  fichier:File;

  constructor() { }

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
}
