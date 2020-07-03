import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-avertissement',
  templateUrl: './avertissement.component.html',
  styleUrls: ['./avertissement.component.css']
})
export class AvertissementComponent implements OnInit {

  title:string;
  message:string;

  constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<AvertissementComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
      this.title=data.title;
      this.message=data.message;
    }

  ngOnInit() {
  }

  fermerSelection() {
      this.dialogRef.close();
  }

}
