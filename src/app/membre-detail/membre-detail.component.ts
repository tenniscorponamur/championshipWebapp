import { Component, OnInit, Input } from '@angular/core';
import { Membre } from '../membre';

import { Router,ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {MembreService} from '../membre.service';

@Component({
  selector: 'app-membre-detail',
  templateUrl: './membre-detail.component.html',
  styleUrls: ['./membre-detail.component.css']
})
export class MembreDetailComponent implements OnInit {

  @Input() membre: Membre;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private membreService: MembreService,
    private location: Location
    ) { }

  ngOnInit() {
    this.getMembre();
  }
  
  getMembre(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    this.membreService.getMembre(id)
      .subscribe(membre => this.membre = membre);
  }
  
  goBack():void{
//    this.router.navigate(['/membres',{filtreNomPrenom:'ceci est un test'}]);
//      this.location.back();
  }

  save():void{
//     this.goBack();
  }

}
