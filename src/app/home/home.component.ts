import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  testEngine:string;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  testAppelToken(){
    this.authenticationService.login();
  }

  testDisconnect(){
    this.authenticationService.disconnect();
    this.testEngine=null;
  }

  testAppelUser() {
    this.authenticationService.getUser().subscribe(
        result => {
              if (result){
                this.testEngine=result.principal;
              }else{
                this.testEngine=null;
              }
          }
      );
  }

}
