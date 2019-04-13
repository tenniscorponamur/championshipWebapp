import { Component, Inject, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import { Membre } from '../membre';
import { CaracteristiqueMatch } from '../caracteristiqueMatch';
import {Match, MATCH_SIMPLE, MATCH_DOUBLE} from '../match';
import {Set as MatchSet} from '../set';
import {getCategorieChampionnat, getTypeChampionnat} from '../championnat';

import {compare} from '../utility';
import { Router,ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {MembreService} from '../membre.service';
import {ClassementMembreService} from '../classement-membre.service';
import {MatchService} from '../match.service';
import {SetService} from '../set.service';
import {AuthenticationService} from '../authentication.service';
import {LocaliteService} from '../localite.service';
import {Club} from '../club';
import {Localite} from '../localite';
import {ClassementCorpo} from '../classementCorpo';
import {ClassementAFT} from '../classementAFT';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {ClubService} from '../club.service';
import {map, startWith} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';

@Component({
  selector: 'app-membre-detail',
  templateUrl: './membre-detail.component.html',
  styleUrls: ['./membre-detail.component.css']
})
export class MembreDetailComponent implements OnInit {

  @Input('master') masterName: string;
  @Output() childResult = new EventEmitter<string>();

  @Output() deleteMembre = new EventEmitter<Membre>();

  resetPasswordOk:boolean=false;
  userImageClass:string = "fa fa-user fa-5x undefinedMember";
  deletable=false;
  showGraph=false;

  // lineChart
  public lineChartData:Array<any> = [];
  public lineChartLabels:Array<any> = [];
  public lineChartType:string = 'line';
  public lineChartOptions:any = {scales: {
                                   yAxes: [{
                                           display: true,
                                           ticks: {
                                               beginAtZero: true,
                                               steps: 10,
                                               stepValue: 5
                                           }
                                       }]
                               }};

    showMatchGraph:boolean=false;

    // Pie
    public pieChartType:string = 'pie';
    public pieChartLabels:string[] = ['Victoire', 'Match nul', 'Défaite'];
    public pieChartData:number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private membreService: MembreService,
    private classementMembreService: ClassementMembreService,
    private matchService:MatchService,
    private authenticationService: AuthenticationService,
    private location: Location,
    public dialog: MatDialog
    ) {
     }

  ngOnInit() {
  }

  private _membre: Membre;

  @Input()
  set membre(membre: Membre) {
    this._membre = membre;
    this.resetPasswordOk=false;
    this.refreshUserImage();
    this.refreshDeletable();
    this.refreshClassement();
    this.refreshMatchsDisputes();
  }

  get membre(): Membre { return this._membre; }

  isUserConnected(){
      return this.authenticationService.isConnected();
  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  isContactsVisibles(){
    if (this.isPrivateInformationsAccessibles()){
      return true;
    }else{
      if (this.isUserConnected()){
        return this._membre.capitaine || this._membre.responsableClub;
      }
    }

  }

  isPrivateInformationsAccessibles(){
    // Administrateur ou responsable du club du membre

    if (this.authenticationService.isAdminUserConnected()){
      return true;
    }

    // S'il s'agit de sa propre fiche, l'autorisation est egalement donnee

    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.id == this.membre.id){
          return true;
        }
        if (user.membre.responsableClub==true){
          if (user.membre.club!=null){
            if (this.membre.club!=null){
              return user.membre.club.id == this.membre.club.id;
            }
          }
        }
      }
    }
    return false;
  }

  get boxClass(): string{
    if (this.isAdminConnected()){
      return "myBox myBoxEditable";
    }else{
      return "myBox";
    }
  }

  get privateBoxClass():string{
    if (this.isPrivateInformationsAccessibles()){
      return "myBox myBoxEditable";
    }else{
      return "myBox";
    }
  }

  refreshUserImage(){
    if (this._membre) {
        if (this._membre.genre == GENRE_HOMME.code){
          this.userImageClass = "fa fa-user fa-5x maleMember";
      }else{
          this.userImageClass = "fa fa-user fa-5x femaleMember";
      }
    }
  }

  refreshDeletable(){
    if (this.isAdminConnected()){
      this.membreService.isMembreDeletable(this.membre).subscribe(result => this.deletable = result);
    }
  }

  refreshClassement(){

    this.showGraph=false;
    this.lineChartData = [];
    this.lineChartLabels=[];

    this.classementMembreService.getClassementsCorpoByMembre(this._membre.id).subscribe(classementsCorpo => {
      this.classementMembreService.getClassementsAFTByMembre(this._membre.id).subscribe(classementsAFT => {

        if ((classementsCorpo!=null && classementsCorpo.length>1) || (classementsAFT!=null && classementsAFT.length>1)){

          let setOfYears = new Set();

          let mapCorpo = new Map();
          if (classementsCorpo!=null){
            classementsCorpo.forEach(classementCorpo => {
              let year = new Date(classementCorpo.dateClassement).getFullYear();
              setOfYears.add(year);
              mapCorpo[year]=classementCorpo.points;
            });
          }

          let mapAFT = new Map();
          if (classementsAFT!=null){
            classementsAFT.forEach(classementAFT => {
              let year = new Date(classementAFT.dateClassement).getFullYear();
              setOfYears.add(year);
              mapAFT[year]=classementAFT.points;
            });
          }

          if (setOfYears.size>1){

            setOfYears.forEach(year => this.lineChartLabels.push(year));
            this.lineChartLabels.sort((a,b) => compare(a,b,true));

            // Ligne Corpo

            let dataCorpo = [];
            let dataAFT = [];

            this.lineChartLabels.forEach(year => {

              // Si pas defini mais connu precedemment, on prend la valeur precedente
              if (mapCorpo[year]==undefined){
                if (dataCorpo.length>0){
                  dataCorpo.push(dataCorpo[dataCorpo.length-1]);
                }else{
                  dataCorpo.push(null);
                }
              }else{
                dataCorpo.push(mapCorpo[year]);
              }

              // Si pas defini mais connu precedemment, on prend la valeur precedente
              if (mapAFT[year]==undefined){
                if (dataAFT.length>0){
                  dataAFT.push(dataAFT[dataAFT.length-1]);
                }else{
                  dataAFT.push(null);
                }
              }else{
                dataAFT.push(mapAFT[year]);
              }

            });

            this.lineChartData.push({data : dataCorpo, label : 'Corpo'});
            this.lineChartData.push({data : dataAFT, label : 'AFT'});

            this.showGraph=true;

          }

        }

      });
     });


  }

  refreshMatchsDisputes(){
    this.showMatchGraph=false;
    let startDate = new Date();
    startDate.setFullYear( startDate.getFullYear() - 1 );
    let endDate = new Date();
    this.matchService.getMatchsValidesByCriteria(this.membre.id,startDate,endDate).subscribe(matchs => {
      let nbVictoires:number=0;
      let nbMatchsNuls:number=0;
      let nbDefaites:number=0;
      matchs.forEach(match => {
        if (this.membre.id == match.joueurVisites1.id || (match.joueurVisites2 && this.membre.id == match.joueurVisites2.id)){
            if (match.pointsVisites > match.pointsVisiteurs){
              nbVictoires++;
            }else if (match.pointsVisites < match.pointsVisiteurs){
              nbDefaites++;
            }else{
              nbMatchsNuls++;
            }
        }else{
            if (match.pointsVisites > match.pointsVisiteurs){
              nbDefaites++;
            }else if (match.pointsVisites < match.pointsVisiteurs){
              nbVictoires++;
            }else{
              nbMatchsNuls++;
            }
        }
      });
      this.pieChartData = [nbVictoires, nbMatchsNuls, nbDefaites];
      this.showMatchGraph=true;
    });

  }

  ouvrirInfosGenerales() {
    if (this.isAdminConnected()){
      let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
        data: { membre: this.membre }, panelClass: "infosGeneralesMembreDialog", disableClose:true
      });

      membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
        this.refreshUserImage();
      });
    }
  }

    ouvrirClub() {
      if (this.isAdminConnected()){
          let clubInfosDialogRef = this.dialog.open(ClubInfosDialog, {
            data: { membre: this.membre }, panelClass: "clubInfosDialog", disableClose:true
          });

          clubInfosDialogRef.afterClosed().subscribe();
      }
    }

    ouvrirCoordonnees(){
      if (this.isPrivateInformationsAccessibles()){
          let coordonneesDialogRef = this.dialog.open(CoordonneesDialog, {
            data: { membre: this.membre }, panelClass: "coordonneesDialog", disableClose:true
          });

          coordonneesDialogRef.afterClosed().subscribe();
      }
    }

    ouvrirContacts(){
      if (this.isPrivateInformationsAccessibles()){
        let contactsDialogRef = this.dialog.open(ContactsDialog, {
          data: { membre: this.membre }, panelClass: "contactsDialog", disableClose:true
        });

        contactsDialogRef.afterClosed().subscribe();
      }
    }

    ouvrirInfosAft(){
      if (this.isAdminConnected()){
        let infosAftDialogRef = this.dialog.open(InfosAftDialog, {
          data: { membre: this.membre }, panelClass: "infosAftDialog", disableClose:true
        });

        infosAftDialogRef.afterClosed().subscribe();
      }
    }

    ouvrirClassement(){
      if (this.isAdminConnected()){
        let classementDialogRef = this.dialog.open(ClassementDialog, {
          data: { membre: this.membre }, panelClass: "classementDialog", disableClose:true
        });

        classementDialogRef.afterClosed().subscribe(result => {
            this.refreshClassement();
        });
      }
    }

    ouvrirMatchs(){
        let matchsDialogRef = this.dialog.open(MatchsDialog, {
          data: { membre : this.membre }, panelClass: "matchsDialog", disableClose:false
        });
    }

    anonymisation(){
      if (this.isAdminConnected()){
        let anonymisationDialogRef = this.dialog.open(AnonymisationDialog, {
          data: { membre: this.membre }, panelClass: "anonymisationDialog", disableClose:true
        });
      }
    }

    resetPassword(){
        this.resetPasswordOk=false;
        this.membreService.resetPassword(this.membre).subscribe(result => this.resetPasswordOk=result);
    }

    supprimerMembre(){
        if (this.deletable){
          this.deleteMembre.emit(this._membre);
        }
    }

  goBack():void{
//    this.router.navigate(['/membres',{filtreNomPrenom:'ceci est un test'}]);
//      this.location.back();
  }

  save():void{
    this.childResult.emit('saveChild');
    // TODO : vider le formulaire : membre = null;
//     this.goBack();
  }

  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }


}

@Component({
  selector: 'infos-generales-membre-dialog',
  templateUrl: './infosGeneralesMembreDialog.html',
})
export class InfosGeneralesMembreDialog {

    genres = GENRES;

    _genre:string;
    _prenom:string;
    _nom:string;
    _dateNaissance:Date;

    showAlert:boolean=false;

    private _membre:Membre;

  constructor(
    public dialogRef: MatDialogRef<InfosGeneralesMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService) {
        this._membre = data.membre;
        this._prenom = this._membre.prenom;
        this._nom = this._membre.nom;
        this._genre = this._membre.genre;
        if (this._membre.dateNaissance){
          this._dateNaissance = new Date(this._membre.dateNaissance);
        }

//        const [day, month, year]: string[] = "02/11/1982".split('/');
//        this._dateNaissance = new Date();
//        this._dateNaissance.setFullYear(+year,+month-1,+day);
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;

      // Verification du genre
      if (this._genre){
          //this.showAlert=false;
      }else{
          this.showAlert=true;
      }

       // Verification du prenom
      if (this._prenom && this._prenom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

    // Verification du nom
      if (this._nom && this._nom.trim().length > 0){
        //this.showAlert=false;
      }else{
        this.showAlert=true;
      }

//      // Verification de la date de naissance
//      if (this._dateNaissance){
//          //this.showAlert=false;
//      }else{
//          this.showAlert=true;
//      }

      if (!this.showAlert){

        this._membre.prenom=this._prenom;
        this._membre.nom=this._nom;
        this._membre.genre=this._genre;
        if (this._dateNaissance!=null){
          this._membre.dateNaissance = new Date(this._dateNaissance);
        }else{
          this._membre.dateNaissance = null;
        }
        if (this._membre.dateNaissance!=null){
          this._membre.dateNaissance.setHours(12);
        }

        if (!this._membre.id){
            // Ajout d'un nouveal utilisateur
            this.membreService.ajoutMembre(this._membre).subscribe(
                member => {
                    this._membre.id=member.id;
                    this.dialogRef.close(this._membre);
             });
        }else{
            //Mise a jour de l'utilisateur
            this.membreService.updateMembreInfosGenerales(this._membre).subscribe(
                result => {
                    this.dialogRef.close(this._membre);
             });
        }

      }

  }
}


@Component({
  selector: 'club-informations-dialog',
  templateUrl: './clubInformationsDialog.html',
})
export class ClubInfosDialog {

  clubCtrl: FormControl=new FormControl();
  clubs:Club[];

    _clubId:number;
    _actif:boolean=true;
    _responsableClub:boolean=false;
    _capitaine:boolean=false;
    _dateAffiliationCorpo:Date;
    _dateDesaffiliationCorpo:Date;
    private _membre:Membre;

  constructor(
    public dialogRef: MatDialogRef<InfosGeneralesMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService,
    private clubService:ClubService
    ) {

      this.clubCtrl = new FormControl();
      this.clubService.getClubs().subscribe(clubs => this.clubs = clubs.sort((a,b) => compare(a.nom,b.nom,true)));

        this._membre = data.membre;
        this._actif = this._membre.actif;
        this._capitaine = this._membre.capitaine;
        this._responsableClub = this._membre.responsableClub;
        // Si le membre n'a pas encore de club precise, on va definir la date du jour
        // comme date d'affiliation
        if (this._membre.club==null){
          this._dateAffiliationCorpo = new Date();
        }else{
          if (this._membre.dateAffiliationCorpo){
            this._dateAffiliationCorpo = new Date(this._membre.dateAffiliationCorpo);
          }
        }
        if (this._membre.dateDesaffiliationCorpo){
          this._dateDesaffiliationCorpo = new Date(this._membre.dateDesaffiliationCorpo);
        }
        if (this._membre.club){
          this._clubId = this._membre.club.id;
        }
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
      if (this._membre.id){
          this._membre.actif = this._actif;
          this._membre.capitaine = this._capitaine;
          this._membre.responsableClub = this._responsableClub;

        if (this._dateAffiliationCorpo!=null){
          this._membre.dateAffiliationCorpo = new Date(this._dateAffiliationCorpo);
        }else{
          this._membre.dateAffiliationCorpo = null;
        }
        if (this._membre.dateAffiliationCorpo!=null){
          this._membre.dateAffiliationCorpo.setHours(12);
        }

        if (this._dateDesaffiliationCorpo!=null){
          this._membre.dateDesaffiliationCorpo = new Date(this._dateDesaffiliationCorpo);
        }else{
          this._membre.dateDesaffiliationCorpo = null;
        }
        if (this._membre.dateDesaffiliationCorpo!=null){
          this._membre.dateDesaffiliationCorpo.setHours(12);
        }

          if (this._clubId){
            this.clubService.getClub(this._clubId).subscribe(club => {
                this._membre.club=club;
                this.updateClubInfosAndCloseDialog();
            });
          }else{
              this._membre.club=null;
              this.updateClubInfosAndCloseDialog();
          }
      }
  }

  updateClubInfosAndCloseDialog(){
    //Mise a jour du club du membre
    this.membreService.updateClubInfos(this._membre).subscribe(
        result => {
            this.dialogRef.close(this._membre);
     });
  }
}


@Component({
  selector: 'coordonnees-dialog',
  templateUrl: './coordonneesDialog.html',
  styleUrls: ['./coordonneesDialog.css']
})
export class CoordonneesDialog implements OnInit {

   localiteControl = new FormControl();
   rueControl = new FormControl();
   private _membre:Membre;

   _codePostal:string;
   _localite:string;
   _rue:string;
   _rueNumero:string;
   _rueBoite:string;

   localites:Localite[]=[];
   rues:string[]=[];

   filteredLocalites:Observable<Localite[]>;
   filteredRues:Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<CoordonneesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService,
    private localiteService: LocaliteService
    ) {
        this._membre = data.membre;
        this._codePostal=this._membre.codePostal;
        this._localite=this._membre.localite;
        this._rue=this._membre.rue;
        this._rueNumero=this._membre.rueNumero;
        this._rueBoite=this._membre.rueBoite;

        this.localiteService.getLocalites().subscribe(localites => {
          this.localites = localites.sort((a,b) => compare(a.nomLocalite,b.nomLocalite,true));
        }
        );
    }

    codePostalChanged(){
        this._localite='';
        if (this._codePostal != null && this._codePostal != undefined && this._codePostal != ''){
          this.localiteService.getRuesByCodePostal(this._codePostal).subscribe(rues => {
            this.rues = rues.sort((a,b) => compare(a,b,true));
          }
          );
        }
    }

    localiteSelected(){
        if (this._codePostal == null || this._codePostal == undefined || this._codePostal == ''){
            let localite:Localite = this.localites.find(localite => localite.nomLocalite == this._localite);
            if (localite!=null){
                this._codePostal=localite.codePostal;
            }
        }

    }

  ngOnInit() {
    this.filteredLocalites = this.localiteControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterWithLocalite(value))
      );
    this.filteredRues = this.rueControl.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterWithRue(value))
          );
  }

  private _filterWithLocalite(value: string): Localite[] {
    const filterValue = value.toLowerCase();
    return this.localites.filter(localite => {
        return localite.nomLocalite.toLowerCase().includes(filterValue)
            && (this._codePostal==null || this._codePostal==undefined || this._codePostal=='' || localite.codePostal == this._codePostal);
    }
    );
  }

  private _filterWithRue(value: string): string[] {
    const filterValue = value.toLowerCase();
      return this.rues.filter(rue => {
          return rue.toLowerCase().includes(filterValue);
        }
      );
  }


  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
        this._membre.codePostal=this._codePostal;
        this._membre.localite=this._localite;
        this._membre.rue=this._rue;
        this._membre.rueNumero=this._rueNumero;
        this._membre.rueBoite=this._rueBoite;

        //Mise a jour des coordonnees du membre
        this.membreService.updateCoordonnees(this._membre).subscribe(
            result => {
                this.dialogRef.close(this._membre);
         });
  }

}


@Component({
  selector: 'contacts-dialog',
  templateUrl: './contactsDialog.html',
})
export class ContactsDialog {

   private _membre:Membre;
   _telephone:string;
   _gsm:string;
   _mail:string;

  constructor(
    public dialogRef: MatDialogRef<ContactsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService
    ) {
        this._membre = data.membre;
        this._telephone=this._membre.telephone;
        this._gsm=this._membre.gsm;
        this._mail=this._membre.mail;
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

        this._membre.telephone=this._telephone;
        this._membre.gsm=this._gsm;
        this._membre.mail=this._mail;

        //Mise a jour des coordonnees du membre
        this.membreService.updateContacts(this._membre).subscribe(
            result => {
                this.dialogRef.close(this._membre);
         });

  }

}

@Component({
  selector: 'infos-aft-dialog',
  templateUrl: './infosAftDialog.html',
})
export class InfosAftDialog {

   private _membre:Membre;
   _numeroAft: string;
   _numeroClubAft: string;
   _dateAffiliationAft: Date;
   _onlyCorpo: boolean;

  constructor(
    public dialogRef: MatDialogRef<InfosAftDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService
    ) {
        this._membre = data.membre;
        this._numeroAft = this._membre.numeroAft;
        this._numeroClubAft = this._membre.numeroClubAft;
        if (this._membre.dateAffiliationAft){
          this._dateAffiliationAft = new Date(this._membre.dateAffiliationAft);
        }
        this._onlyCorpo = this._membre.onlyCorpo;
    }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

        this._membre.numeroAft=this._numeroAft;
        this._membre.numeroClubAft=this._numeroClubAft;
        this._membre.onlyCorpo=this._onlyCorpo;

        if (this._dateAffiliationAft!=null){
          this._membre.dateAffiliationAft = new Date(this._dateAffiliationAft);
        }else{
          this._membre.dateAffiliationAft = null;
        }
        if (this._membre.dateAffiliationAft!=null){
          this._membre.dateAffiliationAft.setHours(12);
        }

        //Mise a jour des infos AFT du membre
        this.membreService.updateInfosAft(this._membre).subscribe(
            result => {
                this.dialogRef.close(this._membre);
         });

  }

}

@Component({
  selector: 'classement-dialog',
  templateUrl: './classementDialog.html',
  styleUrls: ['./classementDialog.css']
})
export class ClassementDialog implements OnInit {

    membre:Membre;
    classementsCorpo:ClassementCorpo[]=[];
    echellesCorpo:any[]=[];
    classementsAFT:ClassementAFT[]=[];
    echellesAFT:any[]=[];

  constructor(
    public dialogRef: MatDialogRef<ClassementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private classementMembreService: ClassementMembreService,
    public dialog: MatDialog
    ) {
        this.membre = data.membre;
    }

  ngOnInit() {
        this.classementMembreService.getEchellesCorpo().subscribe(echelles => {
            this.echellesCorpo = echelles;
            this.classementMembreService.getClassementsCorpoByMembre(this.membre.id).subscribe(classementsCorpo => {
              this.classementsCorpo = classementsCorpo.sort((a,b) => compare(a.dateClassement, b.dateClassement, false));
              this.classementsCorpo.forEach(classementCorpo => classementCorpo.dateClassement = new Date(classementCorpo.dateClassement));
            });
          });

        this.classementMembreService.getEchellesAFT().subscribe(echelles => {
            this.echellesAFT = echelles;
            this.classementMembreService.getClassementsAFTByMembre(this.membre.id).subscribe(classementsAFT => {
              this.classementsAFT = classementsAFT.sort((a,b) => compare(a.dateClassement, b.dateClassement, false));
              this.classementsAFT.forEach(classementAFT => classementAFT.dateClassement = new Date(classementAFT.dateClassement));
            });
          });

  }

  getEchellesAugmented(classementAFT:ClassementAFT){
    return this.echellesAFT.filter(echelleAFT => echelleAFT.actif || echelleAFT.code==classementAFT.codeClassement);
  }

  classeEchelleAFT(echelleAFT){
    if (echelleAFT.actif==false){
      return "echelleAFTInactive";
    }
    return "";
  }

  addClassementCorpo(){
    let classementCorpo = new ClassementCorpo();
    classementCorpo.dateClassement = new Date();
    classementCorpo.dateClassement.setHours(12);

    // Recuperer le dernier classement en date, sinon mettre 5
    if (this.classementsCorpo.length>0){
      classementCorpo.points = this.classementsCorpo[0].points;
    }else{
      if (this.echellesCorpo!=null && this.echellesCorpo.length>0){
        classementCorpo.points = this.echellesCorpo[0].points;
      }
    }

    this.classementsCorpo.push(classementCorpo);

    this.sortClassementsCorpo();
  }

  sortClassementsCorpo(){
      this.classementsCorpo = this.classementsCorpo.sort((a,b) => compare(new Date(a.dateClassement), new Date(b.dateClassement), false));
  }

  addClassementAFT(){
    let classementAFT = new ClassementAFT();
    classementAFT.dateClassement = new Date();
    classementAFT.dateClassement.setHours(12);

    // Recuperer le dernier classement en date, sinon mettre NC-5
    if (this.classementsAFT.length>0){
      classementAFT.codeClassement = this.classementsAFT[0].codeClassement;
    }else{
      if (this.echellesAFT!=null && this.echellesAFT.length>0){
        classementAFT.codeClassement = this.echellesAFT[0].code;
      }
    }

    this.classementsAFT.push(classementAFT);

    this.sortClassementsAFT();
  }

  sortClassementsAFT(){
      this.classementsAFT = this.classementsAFT.sort((a,b) => compare(new Date(a.dateClassement), new Date(b.dateClassement), false));
  }

  addOfficialAFT(){
    if (this.membre.numeroAft!=null) {
      this.classementMembreService.getOfficialAFT(this.membre.numeroAft).subscribe(result => {
        if (result){

            let echelleWithSameCode = this.echellesAFT.find(echelleAFT => echelleAFT.code==result.echelle);

            if (echelleWithSameCode){
                let classementAFT = new ClassementAFT();
                classementAFT.dateClassement = new Date();
                classementAFT.dateClassement.setHours(12);

                classementAFT.codeClassement=echelleWithSameCode.code;

                this.classementsAFT.push(classementAFT);

                this.sortClassementsAFT();
            }

        }
      });
    }
  }

  simulationNouveauClassement(){
      let startDate = null;
      if (this.classementsCorpo.length>0){
          startDate = this.classementsCorpo[0].dateClassement;
      }

    let simulationClassementDialogRef = this.dialog.open(SimulationClassementDialog, {
      data: { membre: this.membre, startDate: startDate }, panelClass: "simulationClassementDialog", disableClose:false
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.classementsCorpo.forEach(classementCorpo => {
      classementCorpo.dateClassement = new Date(classementCorpo.dateClassement);
      classementCorpo.dateClassement.setHours(12);
    });

    this.classementsAFT.forEach(classementAFT => {
      classementAFT.dateClassement = new Date(classementAFT.dateClassement);
      classementAFT.dateClassement.setHours(12);

      let echelleWithSameCode = this.echellesAFT.find(echelleAFT => echelleAFT.code==classementAFT.codeClassement);
      if (echelleWithSameCode!=null){
        classementAFT.points=echelleWithSameCode.points;
      }
    });

    this.classementMembreService.updateClassementsCorpo(this.membre.id,this.classementsCorpo).subscribe(classementCorpoActuel => {
      this.membre.classementCorpoActuel = classementCorpoActuel;
      this.classementMembreService.updateClassementsAFT(this.membre.id,this.classementsAFT).subscribe(classementAFTActuel => {
            this.membre.classementAFTActuel = classementAFTActuel;
            this.dialogRef.close(true);
            }
          );
      }
    );

  }
}

@Component({
  selector: 'simulation-classement-dialog',
  templateUrl: './simulationClassementDialog.html',
})
export class SimulationClassementDialog {

    simulationInProgress:boolean=false;
    showAlert:boolean=false;
    showDetails:boolean=false;
    startDate:Date;
    endDate:Date;
    anciensPoints:number;
    nouveauxPoints:number;
    caracteristiquesMatchs:CaracteristiqueMatch[]=[];

   private _membre:Membre;

  constructor(
    public dialogRef: MatDialogRef<SimulationClassementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private classementMembreService: ClassementMembreService
    ) {
        this._membre = data.membre;

        this.startDate = data.startDate;
        this.endDate=new Date();
    }

  cancel(): void {
    this.dialogRef.close();
  }

  getTypeMatch(match:Match):string{
    return (match.type == MATCH_SIMPLE ? "Simple" : "Double");
  }

  getResultat(resultatMatch):string{
    if (resultatMatch=="victoire"){
      return "Victoire";
    }else if (resultatMatch=="matchNul"){
      return "Match nul";
    }else if (resultatMatch=="defaite"){
      return "Défaite";
    }
  }

  simuler():void{

      this.simulationInProgress=true;
      this.showAlert=false;
      this.showDetails=false;
      this.nouveauxPoints=null;
      this.caracteristiquesMatchs=[];

      if (this.startDate==null||this.startDate==undefined||this.endDate==null||this.endDate==undefined||this.startDate >= this.endDate){
        this.showAlert=true;
      }else{

          this.startDate = new Date(this.startDate);
          this.startDate.setHours(12);

          this.endDate = new Date(this.endDate);
          this.endDate.setHours(12);

          this.classementMembreService.simulationClassementCorpoWithDetail(this._membre.id, this.startDate, this.endDate).subscribe(infosNouveauClassement => {
            this.anciensPoints = infosNouveauClassement.pointsDepart;
            this.nouveauxPoints = infosNouveauClassement.pointsFin;
            this.caracteristiquesMatchs = infosNouveauClassement.caracteristiquesMatchList;
            this.simulationInProgress=false;
          });

      }
  }

  getTotalPoints():number{
    let totalPoints:number = 0;
    this.caracteristiquesMatchs.forEach(caracMatch => totalPoints+=caracMatch.pointsGagnesOuPerdus);
    return totalPoints;
  }

  showOrHideDetails(){
    this.showDetails=!this.showDetails;
  }

}

@Component({
  selector: 'matcs-dialog',
  templateUrl: './matchsDialog.html',
  styleUrls: ['./matchsDialog.css']
})
export class MatchsDialog implements OnInit {

  private membre:Membre;
  chargementMatchs:boolean=true;
  startDate:Date;
  endDate:Date;
  matchsAvecSets:MatchAvecSets[]=[];

  constructor(
    private matchService:MatchService,
    private setService:SetService,
    public dialogRef: MatDialogRef<MatchsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.membre=data.membre;
    this.startDate = new Date();
    this.startDate.setFullYear( this.startDate.getFullYear() - 1 );
    this.endDate = new Date();
  }

  ngOnInit() {
    this.loadMatchs();

  // TODO : recuperer les matchs et set joues
  // trier par ordre de rencontre (date decroissante)
  // recuperer les sets et afficher en gras le gagnant (cfr ecran rencontre)

  // TODO : Niveau affichage : afficher joueurs et sets et infos de base sur la rencontre (equipes concernees, championnat, date)


  }

  loadMatchs(){
    this.matchsAvecSets=[];
    if (this.startDate!=null && this.endDate!=null){
    console.log(this.startDate);
    console.log(this.endDate);
      this.chargementMatchs=true;
      this.startDate = new Date(this.startDate);
      this.endDate = new Date(this.endDate);
      this.matchService.getMatchsValidesByCriteria(this.membre.id,this.startDate,this.endDate).subscribe(matchs => {
        matchs.forEach(match => {
          let matchAvecSets = new MatchAvecSets();
          matchAvecSets.match = match;

          this.setService.getSets(match.id).subscribe(sets => {
            matchAvecSets.sets = sets.sort((a, b) => compare(a.ordre, b.ordre, true));
          });

          this.matchsAvecSets.push(matchAvecSets);
        });
        this.matchsAvecSets.sort((a,b) => compare(a.match.rencontre.dateHeureRencontre, b.match.rencontre.dateHeureRencontre, false));
        this.chargementMatchs=false;
      });
    }
  }

  getDescriptionChampionnat(match:Match){
    let descriptionChampionnat = "";
    descriptionChampionnat += getTypeChampionnat(match.rencontre.division.championnat).libelle;
    descriptionChampionnat += " ";
    descriptionChampionnat += match.rencontre.division.championnat.annee;
    descriptionChampionnat += " ";
    descriptionChampionnat += getCategorieChampionnat(match.rencontre.division.championnat).libelle;
    descriptionChampionnat += " ";
    descriptionChampionnat += "Division " + match.rencontre.division.numero;
    if (match.rencontre.poule) {
      descriptionChampionnat += " ";
      descriptionChampionnat += "Poule " + match.rencontre.poule.numero;
    }else{
      descriptionChampionnat += " ";
      descriptionChampionnat += "Interséries";
      if (match.rencontre.informationsInterserie){
        descriptionChampionnat += " (" + match.rencontre.informationsInterserie + ")";
      }
    }
    return descriptionChampionnat;
  }

    isDouble(match: Match) {
        return match.type == MATCH_DOUBLE;
    }

    isVisitesGagnant(match: Match): boolean {
        return match.pointsVisites > match.pointsVisiteurs;
    }

    isVisiteursGagnant(match: Match): boolean {
        return match.pointsVisites < match.pointsVisiteurs;
    }

    getVisitesClass(match: Match) {
        if (this.isVisitesGagnant(match)) {
            return "victorieux";
        }
        return "";
    }

    getVisiteursClass(match: Match) {
        if (this.isVisiteursGagnant(match)) {
            return "victorieux";
        }
        return "";
    }

    getVisitesSetClass(set:MatchSet) {
        if (set.jeuxVisites > set.jeuxVisiteurs) {
            return "victorieux";
        } else if (set.jeuxVisites < set.jeuxVisiteurs) {
            return "";
        } else {
            if (set.visitesGagnant==true) {
                return "victorieux"
            }
        }
        return "";
    }

    getVisiteursSetClass(set: MatchSet) {
        if (set.jeuxVisites < set.jeuxVisiteurs) {
            return "victorieux";
        } else if (set.jeuxVisites > set.jeuxVisiteurs) {
            return "";
        } else {
            if (set.visitesGagnant==false) {
                return "victorieux"
            }
        }
        return "";
    }

  cancel(): void {
    this.dialogRef.close();
  }


}

class MatchAvecSets{
  match:Match;
  sets:MatchSet[]=[];
}

@Component({
  selector: 'anonymisation-dialog',
  templateUrl: './anonymisationDialog.html',
})
export class AnonymisationDialog {

   private _membre:Membre;
   nom:string;
   prenom:string;

  constructor(
    public dialogRef: MatDialogRef<InfosAftDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService
    ) {
        this._membre = data.membre;
        this.nom = this._membre.nom;
        this.prenom = this._membre.prenom;
    }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    // Anonymisation du membre
    this.membreService.anonymisation(this._membre).subscribe(
        membre => {
            Object.assign(this._membre, membre);
            this.dialogRef.close();
     });

    }

}
