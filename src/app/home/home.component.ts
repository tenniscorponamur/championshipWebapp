import { Component} from '@angular/core';
import {MembreService} from '../membre.service';
//import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(
    private membreService: MembreService) { }
  
  getListeForces(){
      this.membreService.getListeForce().subscribe(result => {
      //saveAs(result, "listeForces.pdf");
      var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

}
