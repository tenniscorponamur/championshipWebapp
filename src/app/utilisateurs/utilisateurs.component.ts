import { Component, OnInit, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, Sort} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {User} from '../user';
import {UserService} from '../user.service';
import {UserDialog} from '../utilisateur-detail/utilisateur-detail.component';
import {compare} from '../utility';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css']
})
export class UtilisateursComponent implements OnInit {

  actualSort:Sort;
  sortedUsers:User[];
  selectedUser:User;

  constructor(
    private userService:UserService,
    public dialog: MatDialog) { }

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
            case 'username': return compare(a.username, b.username, isAsc);
            case 'nom': return compare(a.nom, b.nom, isAsc);
            case 'prenom': return compare(a.prenom, b.prenom, isAsc);
            default: return 0;
          }
        });

    }
  }

    nouvelUtilisateur(){
        let nouvelUtilisateur: User = new User();

        let userDialogRef = this.dialog.open(UserDialog, {
            data: { utilisateur: nouvelUtilisateur }, panelClass: "userDialog", disableClose:true
        });

        userDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedUser = result;
                this.sortedUsers.push(this.selectedUser);
                this.sortData(this.actualSort);
            }
        });
    }

  ouvrirUtilisateur(utilisateur:User):void{
    this.selectedUser=utilisateur;
  }
  
    deleteUtilisateur(userToDelete:User){
        this.userService.deleteUtilisateur(userToDelete).subscribe(result => {
            this.selectedUser = null;

            let indexInSorted = this.sortedUsers.findIndex(user => user.id == userToDelete.id);
            if (indexInSorted!=-1){
                this.sortedUsers.splice(indexInSorted,1);
            }

        });
    }

}
