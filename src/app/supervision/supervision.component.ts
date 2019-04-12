import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ClassementCorpoJobService} from '../classement-corpo-job.service';
import {compare} from '../utility';

@Component({
  selector: 'app-supervision',
  templateUrl: './supervision.component.html',
  styleUrls: ['./supervision.component.css']
})
export class SupervisionComponent implements OnInit {

  calculImpossible:boolean=true;
  jobInProgress:any;
  finishedJobs:any[]=[];
  traces:string="";
  selectedFinishedJob:any;
  finishedTraces:string="";

  constructor(private classementCorpoJobService:ClassementCorpoJobService, public dialog: MatDialog) {
    classementCorpoJobService.getJobs("WORK_IN_PROGRESS").subscribe(jobs => {
      if (jobs.length==0){
        this.calculImpossible = false;
      }else{
        this.jobInProgress = jobs[0];
        this.refreshTraces();
        this.startRefresh();
      }
    });
    classementCorpoJobService.getJobs("FINISHED").subscribe(jobs => {
      this.finishedJobs = jobs.sort((a,b) => compare(a.id,b.id,false));
    });
  }

  ngOnInit() {
  }

  checkJobStatusAndRefreshTraces(){
    this.classementCorpoJobService.getJob(this.jobInProgress.id).subscribe(job => {
      if (job.status != "WORK_IN_PROGRESS"){
        this.continueTimer = false;
        this.refreshTraces();
        this.calculImpossible = false;
      }else{
        this.refreshTraces();
      }
    });

  }

  refreshTraces(){
    this.classementCorpoJobService.getTraces(this.jobInProgress.id).subscribe(jobTraces => {
      this.traces = "";
      jobTraces.sort((a,b) => compare(a.id,b.id,false)).forEach(jobTrace => this.traces += jobTrace.message + "\n");
    });
  }

  selectFinishedJob(finishedJob:any){
    this.selectedFinishedJob = finishedJob;
    this.classementCorpoJobService.getTraces(finishedJob.id).subscribe(jobTraces => {
      this.finishedTraces = "";
      jobTraces.sort((a,b) => compare(a.id,b.id,false)).forEach(jobTrace => this.finishedTraces += jobTrace.message + "\n");
    });
  }

  deleteFinishedJob(){
    let index = this.finishedJobs.findIndex(job => job.id == this.selectedFinishedJob.id);
    this.classementCorpoJobService.deleteJob(this.selectedFinishedJob.id).subscribe(deleted => {
        this.selectedFinishedJob=null;
        this.finishedTraces="";
        this.finishedJobs.splice(index,1);
    });
  }

  continueTimer:boolean=false;
  interval;

  startRefresh() {
    this.continueTimer = true;
    this.interval = setInterval(() => {
      if(this.continueTimer) {
        this.checkJobStatusAndRefreshTraces();
      } else {
        clearInterval(this.interval);
      }
    },1000)
  }

  calculNouveauxClassements() {

      let startDateDialogRef = this.dialog.open(StartDateDialog, {
        data: { }, panelClass: "startDateDialog", disableClose:false
      });

      startDateDialogRef.afterClosed().subscribe(job => {
          if (job){
            this.jobInProgress = job;
            this.calculImpossible = true;
            this.refreshTraces();
            this.startRefresh();
          }
      });
  }

}

@Component({
  selector: 'startDate-dialog',
  templateUrl: './startDateDialog.html'
})
export class StartDateDialog implements OnInit {

  startDate:Date;
  avecSauvegarde:boolean=false;

  constructor(
    private classementCorpoJobService:ClassementCorpoJobService,
    public dialogRef: MatDialogRef<StartDateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        this.startDate = new Date();
        this.startDate.setFullYear( this.startDate.getFullYear() - 1 )
    }

  ngOnInit() {
  }

  launchJob(){
    if (this.startDate){
      this.classementCorpoJobService.launchJob(new Date(this.startDate),this.avecSauvegarde).subscribe(job => this.dialogRef.close(job));
    }

  }

  cancel(): void {
    this.dialogRef.close();
  }

}
