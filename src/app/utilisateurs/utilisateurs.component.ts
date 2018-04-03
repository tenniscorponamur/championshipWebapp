import { Component, OnInit, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, Sort} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import { RxResponsiveService } from 'rx-responsive';
import {User} from '../user';
import {UserService} from '../user.service';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css']
})
export class UtilisateursComponent implements OnInit {

  actualSort:Sort;
  sortedUsers:User[];

  constructor(public media: RxResponsiveService,
    private userService:UserService) { }

  ngOnInit() {
      this.userService.getUsers().subscribe(utilisateurs => {this.sortedUsers = utilisateurs; this.sortData(this.actualSort);});
  }
  
  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedUsers.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedUsers = data;
          return;
        }

        this.sortedUsers = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'nom': return compare(a.nom, b.nom, isAsc);
            case 'prenom': return compare(a.prenom, b.prenom, isAsc);
            default: return 0;
          }
        });

    }
  }

}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
