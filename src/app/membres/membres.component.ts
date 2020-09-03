import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import {FormControl} from '@angular/forms';
import { Membre } from '../membre';
import { MembreService } from '../membre.service';
import {AuthenticationService} from '../authentication.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort, Sort} from '@angular/material';
import {InfosGeneralesMembreDialog} from '../membre-detail/membre-detail.component';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {of} from 'rxjs/observable/of';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {ClubService} from '../club.service';
import {Club} from '../club';
import {Localite} from '../localite';
import {compare} from '../utility';
import { saveAs } from 'file-saver';
import {Genre, GENRES} from '../genre';
import {ClassementCorpo} from '../classementCorpo';
import {ClassementMembreService} from '../classement-membre.service';
import {LocaliteService} from '../localite.service';
import {AvertissementComponent} from '../avertissement/avertissement.component';
import {TacheService} from '../tache.service';

@Component({
  selector: 'app-membres',
  templateUrl: './membres.component.html',
  styleUrls: ['./membres.component.css']
})
export class MembresComponent implements OnInit, AfterViewInit {

//  applyFilter(filterValue: string) {
//    filterValue = filterValue.trim(); // Remove whitespace
//    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
//    this.dataSource.filter = filterValue;
//  }
//  @ViewChild(MatSort) sort: MatSort;
//
  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
//      console.log("sort");
//      this.dataSource.sort = this.sort;
  }

  clubs:Club[];
  genres:Genre[];
  echellesCorpo:any[]=[];
  preparationExportMembres:boolean=false;

    componentName:string="membresComponent";
    @ViewChild("membreDetail") membreDetailComponent: ElementRef;
    @ViewChild("membreList") membreListComponent: ElementRef;

    filtreNomPrenom:string;
    filtreSelectedClubs:Club[]=[];

    filtreEchellecorpo:number;
    filtreNumeroClubAFT:string;
    filtreSelectedGenre:Genre;
    filtreActivite:string;

    membres:Membre[];
    sortedMembers:Membre[];
    filteredMembers:Membre[];
    actualSort:Sort;
    selectedMember:Membre;

    chargementMembres:boolean=true;

  constructor(
    private route: ActivatedRoute,
    private membreService:MembreService,
    private clubService:ClubService,
    private authenticationService: AuthenticationService,
    private classementMembreService: ClassementMembreService,
    public dialog: MatDialog) {
      this.genres = GENRES;
    }

  ngOnInit() {
      this.clubService.getClubs().subscribe(clubs => this.clubs = clubs.sort((a, b) => compare(a.nom, b.nom,true)));
      this.classementMembreService.getEchellesCorpo().subscribe(echellesCorpo => this.echellesCorpo = echellesCorpo);
      this.membreService.getMembres(null).subscribe(membres => {this.chargementMembres=false;this.sortedMembers = membres; this.sortData(this.actualSort); this.selectMemberFromParam();});
  }

  isAdminConnected(){
      return this.authenticationService.isAdminUserConnected();
  }

  isResponsableClubConnected(){
    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.responsableClub==true){
            return true;
        }
      }
    }
    return false;
  }

  exportMembresByResponsableClub(){
    let user = this.authenticationService.getConnectedUser();
      if (this.isResponsableClubConnected()){
        if (user.membre.club!=null){
            this.preparationExportMembres = true;
            this.membreService.getExportMembresByClub(user.membre.club).subscribe(result => {
                this.preparationExportMembres = false;
                saveAs(result, "membres_club_" + user.membre.club.nom + ".xlsx");
            //var fileURL = URL.createObjectURL(result);window.open(fileURL);
          },error => {console.log(error);});
        }
      }
  }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedMembers.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedMembers = data;
          return;
        }

        this.sortedMembers = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'nom': return compare(a.nom, b.nom, isAsc);
            case 'prenom': return compare(a.prenom, b.prenom, isAsc);
            //case 'club': return compare(a.club.nom, b.club.nom, isAsc);
            case 'pointsCorpo': {
              let pointsA = (a.classementCorpoActuel!=null)?a.classementCorpoActuel.points:null;
              let pointsB = (b.classementCorpoActuel!=null)?b.classementCorpoActuel.points:null;
              return compare(pointsA, pointsB, isAsc);
            }
            default: return 0;
          }
        });
    }
    this.filtre();
  }

  selectMemberFromParam(){
    this.route.queryParams
      .filter(params => params.memberId)
      .subscribe(params => {
        if (params.memberId!=null) {
          console.log(params.memberId);
          this.selectedMember = this.filteredMembers.find(membre => membre.id == params.memberId);
        }
      });
  }

    isOtherCriterias(){
    return (this.filtreSelectedGenre != null && this.filtreSelectedGenre != undefined)
        || (this.filtreActivite != null && this.filtreActivite != undefined)
        || (this.filtreEchellecorpo != null && this.filtreEchellecorpo != undefined)
        || (this.filtreNumeroClubAFT != null && this.filtreNumeroClubAFT != undefined && this.filtreNumeroClubAFT.trim()!='');
    }

    filtre(): void {

        this.filteredMembers = this.sortedMembers;

        if (this.filtreNomPrenom && this.filtreNomPrenom.trim().length > 0){

            this.filteredMembers = this.filteredMembers.filter(membre =>
                membre.nom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
             || membre.prenom.toLowerCase().includes(this.filtreNomPrenom.toLowerCase())
             || (membre.numeroAft!=null && membre.numeroAft==this.filtreNomPrenom.toLowerCase()) );

        }
        if (this.filtreSelectedClubs && this.filtreSelectedClubs.length > 0){
            this.filteredMembers = this.filteredMembers.filter(({club}) => {
                // Workaround car je ne parviens pas a faire en sorte que la methode includes retourne true
                return this.filtreSelectedClubs.some(selectedClub => {
                    if (club){
                        return selectedClub.id==club.id
                    }
                    return false;
                })});
        }

        if (this.filtreSelectedGenre != null && this.filtreSelectedGenre != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => membre.genre == this.filtreSelectedGenre.code);
        }

        if (this.filtreActivite != null && this.filtreActivite != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (this.filtreActivite=="true"){
                    return membre.actif;
                }else{
                    return !membre.actif;
                }
            });
        }

        if (this.filtreEchellecorpo != null && this.filtreEchellecorpo != undefined){
            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (membre.classementCorpoActuel != null){
                    return membre.classementCorpoActuel.points == this.filtreEchellecorpo;
                }
                return false;
            });
        }

        if (this.filtreNumeroClubAFT != null && this.filtreNumeroClubAFT != undefined && this.filtreNumeroClubAFT.trim().length > 0){

            this.filteredMembers = this.filteredMembers.filter(membre => {
                if (membre.numeroClubAft!=null){
                    return membre.numeroClubAft.toLowerCase().includes(this.filtreNumeroClubAFT.toLowerCase());
                }
            });

        }

    }

    nouveauMembre(){
        let nouveauMembre: Membre = new Membre();

        let membreInfosGeneralesDialogRef = this.dialog.open(InfosGeneralesMembreDialog, {
            data: {membre: nouveauMembre }, panelClass: "infosGeneralesMembreDialog", disableClose:true
        });

        membreInfosGeneralesDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedMember = result;
                this.sortedMembers.push(this.selectedMember);
                this.sortData(this.actualSort);
            }
        });


    }

    styleMembre(membre:Membre){
        if (!membre.actif){
            return "membreInactif";
        }else{
            return "";
        }
    }

    ouvrirMembre(membre:Membre):void{
      this.selectedMember=membre;
    }

    ouvrirMembreOnMobile(membre:Membre):void{
      this.selectedMember=membre;
      this.membreDetailComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }

    deleteMembre(membreToDelete:Membre){
        this.membreService.deleteMembre(membreToDelete).subscribe(result => {
            this.selectedMember = null;

            let indexInFiltered = this.filteredMembers.findIndex(membre => membre.id == membreToDelete.id);
            if (indexInFiltered!=-1){
                this.filteredMembers.splice(indexInFiltered,1);
            }
            let indexInSorted = this.sortedMembers.findIndex(membre => membre.id == membreToDelete.id);
            if (indexInSorted!=-1){
                this.sortedMembers.splice(indexInSorted,1);
            }

        });
    }

  childResult(childResult : string){
      console.log("resultat : " + childResult);
    //this.membreListComponent.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }


    importer(){

        let importMembresDialogRef = this.dialog.open(ImportMembresDialog, {
            data: {}, panelClass: "importMembresDialog", disableClose:false
        });

    }

    nouvelleDemande(){

        this.dialog.open(DemandeDialog, {
            data: { }, panelClass: "demandeDialog", disableClose:false
        });

    }

}


@Component({
  selector: 'import-membres-dialog',
  templateUrl: './importMembresDialog.html',
})
export class ImportMembresDialog {

    showWorkInProgress:boolean=false;
    showFinished:boolean=false;

  constructor(
    public dialogRef: MatDialogRef<ImportMembresDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private membreService: MembreService) {
    }

  getTemplate(){
    this.membreService.getTemplateImportMembres().subscribe(result => {
      saveAs(result, "template.xls");
      //var fileURL = URL.createObjectURL(result);window.open(fileURL);
    },error => {console.log(error);});
  }

  importData(event:any) {
    let reader = new FileReader();
      if(event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.showFinished=false;
          this.showWorkInProgress=true;
          let content = (<string> reader.result).split(',')[1];
          this.membreService.importData(content).subscribe(result => {
            this.showWorkInProgress=false;
            this.showFinished=true;
          });
        };
      }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'demande-dialog',
  templateUrl: './demandeDialog.html',
})
export class DemandeDialog {

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DemandeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  nouveauMembre(){
    this.dialogRef.close();
    this.dialog.open(NouveauMembreDialog, {
        data: { }, panelClass: "nouveauMembreDialog", disableClose:true
    });
  }

  desactiverMembre(){
    this.dialogRef.close();
    this.dialog.open(ActiviteMembreDialog, {
        data: { activite:true }, panelClass: "activiteMembreDialog", disableClose:true
    });
  }

  reactiverMembre(){
    this.dialogRef.close();
    this.dialog.open(ActiviteMembreDialog, {
        data: { activite:false }, panelClass: "activiteMembreDialog", disableClose:true
    });
  }

  changementPointsMembre(){
    this.dialogRef.close();
    this.dialog.open(ChangementPointsMembreDialog, {
        data: { }, panelClass: "changementPointsMembreDialog", disableClose:true
    });
  }


  cancel(): void {
    this.dialogRef.close();
  }

}


@Component({
  selector: 'nouveau-membre-dialog',
  templateUrl: './nouveauMembreDialog.html',
  styleUrls: ['./nouveauMembreDialog.css']
})
export class NouveauMembreDialog implements OnInit {

  genres = GENRES;
  _genre:string;
  _prenom:string;
  _nom:string;
  _dateNaissance:Date;

   localiteControl = new FormControl();
   rueControl = new FormControl();
   private _membre:Membre;

   _codePostal:string;
   _rueNumero:string;
   _rueBoite:string;

   localites:Localite[]=[];
   rues:string[]=[];

   filteredLocalites:Observable<Localite[]>;
   filteredRues:Observable<string[]>;

   _telephone:string;
   _gsm:string;
   _mail:string;

   _club:Club;

   _numeroAft: string;
   _numeroClubAft: string;
   _onlyCorpo: boolean=false;

   echellesCorpo:any[]=[];
   echellesAFT:any[]=[];
  _codeClassement:string;
  _points:number;

   _comments:string="";
  _adhesionPolitique:boolean=false;

  showAlert:boolean=false;
  showAlertPolitique:boolean=false;
  messageNumeroAft:string;

  constructor(
    private authenticationService: AuthenticationService,
    private membreService: MembreService,
    private classementMembreService: ClassementMembreService,
    private tacheService:TacheService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<NouveauMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private localiteService: LocaliteService) {

    this.localiteService.getLocalites().subscribe(localites => {
        this.localites = localites.sort((a,b) => compare(a.nomLocalite,b.nomLocalite,true));
      }
    );
    let user = this.authenticationService.getConnectedUser();
    if (this.isResponsableClubConnected()){
      if (user.membre.club!=null){
         this._club = user.membre.club;
      }
    }
  }

  isResponsableClubConnected(){
    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.responsableClub==true){
            return true;
        }
      }
    }
    return false;
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


    this.classementMembreService.getEchellesCorpo().subscribe(echelles => {
        this.echellesCorpo = echelles;
    });

    this.classementMembreService.getEchellesAFT().subscribe(echelles => {
        echelles.forEach(echelle => {
          if (echelle.actif){
            this.echellesAFT.push(echelle);
          }
        });
    });
  }

    codePostalChanged(){
        this.localiteControl.setValue('');
        if (this._codePostal != null && this._codePostal != undefined && this._codePostal != ''){
          this.localiteService.getRuesByCodePostal(this._codePostal).subscribe(rues => {
            this.rues = rues.sort((a,b) => compare(a,b,true));
          }
          );
        }
    }

    localiteSelected(){
        if (this._codePostal == null || this._codePostal == undefined || this._codePostal == ''){
            let localite:Localite = this.localites.find(localite => localite.nomLocalite == this.localiteControl.value);
            if (localite!=null){
                this._codePostal=localite.codePostal;
            }
        }

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

  numeroAftChanged(){
    if (this._numeroAft!=null && this._numeroAft.length>0){
      this.membreService.findMembreByNumeroAft(this._numeroAft).subscribe(membre => {
         if (membre != null){
           if (membre.fictif){
              this.messageNumeroAft = "Une demande a déjà été introduite pour ce numéro AFT.";
           }else if (membre.actif){
              this.messageNumeroAft = "Un membre actif possède déjà ce numéro AFT.";
           }else if (!membre.actif){
              this.messageNumeroAft = "Un membre inactif possède déjà ce numéro AFT.";
           }
         }else{
           this.messageNumeroAft = null;
         }
      });
    }else{
       this.messageNumeroAft = null;
    }
  }

  changeOnlyCorpo(){
    if (this._onlyCorpo){
      this._numeroClubAft = "6045";
    }else{
      this._numeroClubAft = "";
    }
  }


  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

    this.showAlert=false;
    this.showAlertPolitique=false;

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

      // Check politique confidentialite
      if (!this._adhesionPolitique){
        this.showAlertPolitique=true;
      }

      if (!this.showAlert && !this.showAlertPolitique && this.messageNumeroAft == null){

          let membre:Membre  = new Membre();
          membre.actif=false;

          membre.prenom=this._prenom;
          membre.nom=this._nom;
          membre.genre=this._genre;
          if (this._dateNaissance!=null){
            membre.dateNaissance = new Date(this._dateNaissance);
          }else{
            membre.dateNaissance = null;
          }
          if (membre.dateNaissance!=null){
            membre.dateNaissance.setHours(12);
          }

          membre.codePostal=this._codePostal;
          membre.localite=this.localiteControl.value;
          membre.rue=this.rueControl.value;
          membre.rueNumero=this._rueNumero;
          membre.rueBoite=this._rueBoite;

          membre.telephone=this._telephone;
          membre.gsm=this._gsm;
          membre.mail=this._mail;

          membre.club=this._club;

          membre.numeroClubAft=this._numeroClubAft;
          membre.onlyCorpo=this._onlyCorpo;

          membre.adhesionPolitique = true;

          this.tacheService.tacheNouveauMembre(membre,this._comments, this._numeroAft, this._codeClassement, this._points).subscribe(result => {
            if (result){
              this.dialogRef.close();
              this.dialog.open(AvertissementComponent, {
                  data: {title: "Information", message:"Demande introduite auprès du Comité. Vous pouvez suivre l'évolution de votre demande sur la page d'accueil"}, panelClass: "avertissementDialog", disableClose: false
              });
            }
          });

      }

  }

}


@Component({
  selector: 'activite-membre-dialog',
  templateUrl: './activiteMembreDialog.html',
  styleUrls: ['./activiteMembreDialog.css']
})
export class ActiviteMembreDialog implements OnInit {

   echellesCorpo:any[]=[];

   typeDemande:string;
   activationMembre:boolean=false;
   membre:Membre;
   _club:Club;
  _points:number;
   _comments:string;

  constructor(
    private authenticationService: AuthenticationService,
    private membreService: MembreService,
    private classementMembreService: ClassementMembreService,
    private tacheService:TacheService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ActiviteMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    // Activite represente l'etat des membres pouvant etre selectionnes
    // (actifs ou pas selon le type de demande associee) --> va influence le type de tache

    if (data.activite){
      this.typeDemande = "Désactiver";
      this.activationMembre=false;
    }else{
      this.typeDemande = "Réactiver";
      this.activationMembre=true;
    }

    let user = this.authenticationService.getConnectedUser();
    if (this.isResponsableClubConnected()){
      if (user.membre.club!=null){
         this._club = user.membre.club;
      }
    }
  }

  ngOnInit() {
    this.classementMembreService.getEchellesCorpo().subscribe(echelles => {
        this.echellesCorpo = echelles;
    });
  }

  selectionMembre(){
      let showMembresInactifs:boolean=false;
      if (this.activationMembre){
        showMembresInactifs = true;
      }

      let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
          data: { club : this._club, inactif:showMembresInactifs }, panelClass: "membreSelectionDialog", disableClose: false
      });
     membreSelectionRef.afterClosed().subscribe(membre => {
      if (membre!==undefined) {
        this.membre = membre;
        if (membre!=null && membre.classementCorpoActuel!=null){
          this._points = membre.classementCorpoActuel.points;
        }else{
          this._points = null;
        }
      }
    });
  }

  clearMembre(){
    this.membre=null;
    this._points = null;
  }

  isResponsableClubConnected(){
    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.responsableClub==true){
            return true;
        }
      }
    }
    return false;
  }

  ouvrirFicheMembre(){
    if (this.membre){
      window.open("./#/membres?memberId=" + this.membre.id);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

  }

}

@Component({
  selector: 'changement-points-membre-dialog',
  templateUrl: './changementPointsMembreDialog.html',
  styleUrls: ['./changementPointsMembreDialog.css']
})
export class ChangementPointsMembreDialog implements OnInit {

   echellesCorpo:any[]=[];

   membre:Membre;
   _club:Club;
   _points:number;
   _comments:string;

  constructor(
    private authenticationService: AuthenticationService,
    private membreService: MembreService,
    private classementMembreService: ClassementMembreService,
    private tacheService:TacheService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ChangementPointsMembreDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    let user = this.authenticationService.getConnectedUser();
    if (this.isResponsableClubConnected()){
      if (user.membre.club!=null){
         this._club = user.membre.club;
      }
    }
  }

  ngOnInit() {
    this.classementMembreService.getEchellesCorpo().subscribe(echelles => {
        this.echellesCorpo = echelles;
    });
  }

  selectionMembre(){
      let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
          data: { club : this._club }, panelClass: "membreSelectionDialog", disableClose: false
      });
     membreSelectionRef.afterClosed().subscribe(membre => {
      if (membre!==undefined) {
        this.membre = membre;
        if (membre!=null && membre.classementCorpoActuel!=null){
          this._points = membre.classementCorpoActuel.points;
        }else{
          this._points = null;
        }
      }
    });
  }

  clearMembre(){
    this.membre=null;
    this._points = null;
  }

  isResponsableClubConnected(){
    let user = this.authenticationService.getConnectedUser();
    if (user!=null){
      if (user.membre!=null){
        if (user.membre.responsableClub==true){
            return true;
        }
      }
    }
    return false;
  }

  ouvrirFicheMembre(){
    if (this.membre){
      window.open("./#/membres?memberId=" + this.membre.id);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {

  }

}


