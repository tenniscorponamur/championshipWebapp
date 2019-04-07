import {Component, Inject, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre, AutorisationRencontre, TYPE_AUTORISATION_ENCODAGE,TYPE_AUTORISATION_VALIDATION} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare, addLeadingZero} from '../utility';
import {MatchService} from '../match.service';
import {RencontreService} from '../rencontre.service';
import {ClassementMembreService} from '../classement-membre.service';
import {AuthenticationService} from '../authentication.service';
import {Match, MATCH_SIMPLE, MATCH_DOUBLE} from '../match';
import {MembreService} from '../membre.service';
import {SetService} from '../set.service';
import {TerrainService} from '../terrain.service';
import {Membre} from '../membre';
import {FormControl} from '@angular/forms';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Club} from '../club';
import {Set} from '../set';
import {Terrain, HoraireTerrain, Court} from '../terrain';
import {Equipe} from '../equipe';
import {Championnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, TYPE_CHAMPIONNAT_COUPE_HIVER} from '../championnat';
import { Genre, GENRE_HOMME, GENRE_FEMME, GENRES} from '../genre';
import {Trace} from '../trace';
import {TraceService} from '../trace.service';


@Component({
    selector: 'app-rencontre-detail',
    templateUrl: './rencontre-detail.component.html',
    styleUrls: ['./rencontre-detail.component.css']
})
export class RencontreDetailComponent extends ChampionnatDetailComponent implements OnInit {

    matchs: MatchExtended[] = [];
    autorisations:AutorisationRencontre[]=[];
    traces:Trace[]=[];
    private mapEquivalence;

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private rencontreService:RencontreService,
        private matchService: MatchService,
        private classementMembreService:ClassementMembreService,
        private authenticationService: AuthenticationService,
        private traceService: TraceService,
        private setService: SetService) {
        super();
    }

    ngOnInit() {
      this.classementMembreService.correspondanceEchelleCorpo().subscribe(mapEquivalence => this.mapEquivalence = mapEquivalence);
    }

    private _rencontre: Rencontre;
    jeuxVisites:number;
    jeuxVisiteurs:number;
    canAuthoriseEncodage:boolean=false;
    canAuthoriseValidation:boolean=false;
    isResultatsRencontreModifiables:boolean=false;
    isResultatsCloturables:boolean=false;
    isPoursuiteEncodagePossible:boolean=false;
    isEtatValidable:boolean=false;
    isValidable:boolean=false;

    @Input()
    set rencontre(rencontre: Rencontre) {
        this._rencontre = rencontre;
        this.refreshBooleansAndTracesAndAutorisations();
        this.getMatchs();
    } 

    get rencontre(): Rencontre {return this._rencontre;}

    isUserConnected(){
        return this.authenticationService.isConnected();
    }
    
    isAdminConnected(){
        return this.authenticationService.isAdminUserConnected();
    }

    redirectToMember(membre:Membre){
        window.open("./#/membres?memberId=" +membre.id);
        //this.router.navigate(['/membres'], {queryParams : {memberId : membre.id} });
    }

    get boxClass(): string{
      if (this.isAdminConnected() && !this.rencontre.division.championnat.cloture){
        return "myBox myBoxEditable";
      }else{
        return "myBox";
      }
    }

    get boxCommentsClass(): string{
      if (this.isResultatsRencontreModifiables && !this.rencontre.division.championnat.cloture){
        return "myBox myBoxEditable";
      }else{
        return "myBox";
      }
    }

    verificationPoints(){
      return true;
    }

    isSimpleExists():boolean{
      let simpleExists:boolean = false;
      this.matchs.forEach(match => {
        if (MATCH_SIMPLE == match.match.type){
          simpleExists = true;
        }
      });
      return simpleExists;
    }

    isDoubleExists():boolean{
      let doubleExists:boolean = false;
      this.matchs.forEach(match => {
        if (MATCH_DOUBLE == match.match.type){
          doubleExists = true;
        }
      });
      return doubleExists;
    }

  getPointsCorpo(membre:Membre):number{
    if (membre.classementCorpoActuel){
      if (this.isChampionnatHomme() && this.mapEquivalence!=null && membre.genre == GENRE_FEMME.code){
        return this.mapEquivalence[membre.classementCorpoActuel.points];
      }else{
        return membre.classementCorpoActuel.points;
      }
    }
    return null;
  }

    pointsSimplesVisites():number{
      let pointsSimples: number = 0;
      this.matchs.forEach(match => {
        if (MATCH_SIMPLE == match.match.type){
          if (match.match.joueurVisites1!=null && match.match.joueurVisites1.classementCorpoActuel!=null){
            pointsSimples = pointsSimples + this.getPointsCorpo(match.match.joueurVisites1);
          }
        }
      });
      return pointsSimples;
    }

    pointsSimplesVisiteurs():number{
      let pointsSimples: number = 0;
      this.matchs.forEach(match => {
        if (MATCH_SIMPLE == match.match.type){
          if (match.match.joueurVisiteurs1!=null && match.match.joueurVisiteurs1.classementCorpoActuel!=null){
            pointsSimples = pointsSimples + this.getPointsCorpo(match.match.joueurVisiteurs1);
          }
        }
      });
      return pointsSimples;
    }

    pointsDoublesVisites():number{

      let pointsDoubles: number = 0;
      // Dans les cas autres que la coupe d'hiver, on somme l'ensemble des doubles
      if (this.rencontre.division.championnat.type!=TYPE_CHAMPIONNAT_COUPE_HIVER.code){
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisites1!=null && match.match.joueurVisites1.classementCorpoActuel!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match.match.joueurVisites1);
            }
            if (match.match.joueurVisites2!=null && match.match.joueurVisites2.classementCorpoActuel!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match.match.joueurVisites2);
            }
          }
        });
      }else{
        let pointsDeuxDoubles = 0;
        let cpt = 0;
        // Sinon on fait deux par deux et on prend le maximum pour afficher l'alerte
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisites1!=null && match.match.joueurVisites1.classementCorpoActuel!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match.match.joueurVisites1);
            }
            if (match.match.joueurVisites2!=null && match.match.joueurVisites2.classementCorpoActuel!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match.match.joueurVisites2);
            }
            cpt++;
          }
          pointsDoubles = Math.max(pointsDoubles, pointsDeuxDoubles);
          if (cpt==2){
            pointsDeuxDoubles = 0;
            cpt = 0;
          }
        });
      }
      return pointsDoubles;

    }

    pointsDoublesVisiteurs():number{
      let pointsDoubles: number = 0;
      // Dans les cas autres que la coupe d'hiver, on somme l'ensemble des doubles
      if (this.rencontre.division.championnat.type!=TYPE_CHAMPIONNAT_COUPE_HIVER.code){
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisiteurs1!=null && match.match.joueurVisiteurs1.classementCorpoActuel!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match.match.joueurVisiteurs1);
            }
            if (match.match.joueurVisiteurs2!=null && match.match.joueurVisiteurs2.classementCorpoActuel!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match.match.joueurVisiteurs2);
            }
          }
        });
      }else{
        let pointsDeuxDoubles = 0;
        let cpt = 0;
        // Sinon on fait deux par deux et on prend le maximum pour afficher l'alerte
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisiteurs1!=null && match.match.joueurVisiteurs1.classementCorpoActuel!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match.match.joueurVisiteurs1);
            }
            if (match.match.joueurVisiteurs2!=null && match.match.joueurVisiteurs2.classementCorpoActuel!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match.match.joueurVisiteurs2);
            }
            cpt++;
          }
          pointsDoubles = Math.max(pointsDoubles, pointsDeuxDoubles);
          if (cpt==2){
            pointsDeuxDoubles = 0;
            cpt = 0;
          }
        });
      }
      return pointsDoubles;

    }

    pointsDepassesSimplesVisites():string{
      return this.pointsDepasses(this.pointsSimplesVisites());
    }

    pointsDepassesSimplesVisiteurs():string{
      return this.pointsDepasses(this.pointsSimplesVisiteurs());
    }

    pointsDepassesDoublesVisites():string{
      return this.pointsDepasses(this.pointsDoublesVisites());
    }

    pointsDepassesDoublesVisiteurs():string{
      return this.pointsDepasses(this.pointsDoublesVisiteurs());
    }

    pointsDepasses(points:number):string{
      if (points < this.rencontre.division.pointsMinimum
          || points > this.rencontre.division.pointsMaximum ){
          return "pointsDepasses";
      }
      return "";
    }
    
    getAutorisationsEncodage(){
        return this.getAutorisationsByType(TYPE_AUTORISATION_ENCODAGE);
    }
    
    getAutorisationsValidation(){
        return this.getAutorisationsByType(TYPE_AUTORISATION_VALIDATION);
    }
    
    getAutorisationsByType(type:string){
        return this.autorisations.filter(autorisation => autorisation.type == type);
    }

    getMatchs() {

        this.matchs = [];
        this.jeuxVisites=0;
        this.jeuxVisiteurs=0;

        // Recuperation des matchs de la rencontre ou creation a la volee s'ils n'existent pas

        this.matchService.getMatchs(this.rencontre.id).subscribe(matchs => {

            matchs.forEach(
                match => {
                    let matchExtended: MatchExtended = new MatchExtended();
                    matchExtended.match = match;

                    this.matchs.push(matchExtended);

                    this.setService.getSets(match.id).subscribe(sets => {
                        matchExtended.sets = sets.sort((a, b) => compare(a.ordre, b.ordre, true));

                        matchExtended.sets.forEach(set => {
                          this.jeuxVisites = this.jeuxVisites + set.jeuxVisites;
                          this.jeuxVisiteurs = this.jeuxVisiteurs + set.jeuxVisiteurs;
                        });

                      });

                });

            this.matchs = this.matchs.sort((a, b) => {
                if (a.match.type == b.match.type) {
                    return compare(a.match.ordre, b.match.ordre, true);
                } else {
                    if (a.match.type == MATCH_SIMPLE) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            });

        }
        );
    }

    getMatchIdent(match: Match): string {
        return (match.type == MATCH_SIMPLE ? "S" : "D") + "#" + match.ordre;
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

    getEditableClass(match:Match){
      if (this.isResultatsRencontreModifiables){
        return "modifiable";
      }
      return "";
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

    getVisitesSetClass(set:Set) {
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

    getVisiteursSetClass(set: Set) {
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

    refreshBooleansAndTracesAndAutorisations() {
        if (this.isUserConnected()){
            this.rencontreService.canAuthoriseEncodage(this.rencontre).subscribe(result => this.canAuthoriseEncodage = result);
            this.rencontreService.canAuthoriseValidation(this.rencontre).subscribe(result => this.canAuthoriseValidation = result);
            this.rencontreService.isResultatsRencontreModifiables(this.rencontre).subscribe(result => this.isResultatsRencontreModifiables = result);
            this.rencontreService.isResultatsCloturables(this.rencontre).subscribe(result => this.isResultatsCloturables = result);
            this.rencontreService.isPoursuiteEncodagePossible(this.rencontre).subscribe(result => this.isPoursuiteEncodagePossible = result);
            this.rencontreService.isEtatValidable(this.rencontre).subscribe(result => this.isEtatValidable = result);
            this.rencontreService.isValidable(this.rencontre).subscribe(result => this.isValidable = result);
            this.traceService.getTraces("rencontre", this.rencontre.id.toString()).subscribe(traces => this.traces = traces);
            this.rencontreService.getAutorisations(this.rencontre).subscribe(autorisations => {
                this.autorisations = autorisations.sort((a, b) => compare(a.membre.nom, b.membre.nom,true))
            });
        }
    }
    
    setResultatsEncodes(resultatsEncodes:boolean){
        
        if (resultatsEncodes){
            
            this.rencontreService.updateResultatsEncodesRencontre(this.rencontre, resultatsEncodes,null).subscribe(resultsEncoded => {
                this.rencontre.resultatsEncodes = resultsEncoded; this.refreshBooleansAndTracesAndAutorisations();
            },error=> console.log(error));
                
        }else{
            
            let messagePoursuiteDialog = this.dialog.open(MessagePoursuiteDialog, {
                data: {}, panelClass: "messagePoursuiteDialog", disableClose: false
            });
            
            messagePoursuiteDialog.afterClosed().subscribe(retour => {
                if (retour){
                    this.rencontreService.updateResultatsEncodesRencontre(this.rencontre, resultatsEncodes,retour.message).subscribe(resultsEncoded => {
                        this.rencontre.resultatsEncodes = resultsEncoded; this.refreshBooleansAndTracesAndAutorisations();
                    },error=> console.log(error));
                }
            });
            
        }
            
    }

    validationParAdversaire(){

      let membresSelectionnables:Membre[]=[];

      if (this.rencontre.equipeVisiteurs.capitaine){
        membresSelectionnables.push(this.rencontre.equipeVisiteurs.capitaine);
      }
      this.getAutorisationsValidation().forEach(authorization => membresSelectionnables.push(authorization.membre));

      let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
          data: { membresSelectionnables : membresSelectionnables}, panelClass: "membreSelectionDialog", disableClose: false
      });

      membreSelectionRef.afterClosed().subscribe(membre => {
          if (membre!==undefined) {

            let askPasswordToValidateRef = this.dialog.open(AskPasswordToValidateDialog, {
                data: { rencontre:this.rencontre , membre : membre}, panelClass: "askPasswordToValidateDialog", disableClose: false
            });


            askPasswordToValidateRef.afterClosed().subscribe(validity => {
              if (validity){
                this.rencontre.valide = true; this.refreshBooleansAndTracesAndAutorisations();
              }
            });

          }
        });

    }

    setValidite(validite:boolean){
        this.rencontreService.updateValiditeRencontre(this.rencontre, validite,null).subscribe(validity => {
            this.rencontre.valide = validity; this.refreshBooleansAndTracesAndAutorisations();
        },error=> console.log(error));
    }

    showHistory(){
        let tracesRencontreDialogRef = this.dialog.open(TracesRencontreDialog, {
            data: {traces: this.traces}, panelClass: "tracesRencontreDialog", disableClose:false
        });
    }

    selectionnerJoueur(match: Match, indexEquipe: number, indexJoueurEquipe: number): void {
        if (this.isResultatsRencontreModifiables){
            let club;
            let anyMemberPossible:boolean=false;
            if (indexEquipe == 1) {
                club = this.rencontre.equipeVisites.club;
                anyMemberPossible = this.isAdminConnected() || this.rencontre.equipeVisites.hybride;
            } else {
                club = this.rencontre.equipeVisiteurs.club;
                anyMemberPossible = this.isAdminConnected() || this.rencontre.equipeVisiteurs.hybride;
            }

            let deselectionPossible:boolean = false;
            if (indexEquipe == 1) {
                if (indexJoueurEquipe == 1) {
                    deselectionPossible = match.joueurVisites1 != null;
                } else {
                    deselectionPossible = match.joueurVisites2 != null;
                }
            }else{
                if (indexJoueurEquipe == 1) {
                    deselectionPossible = match.joueurVisiteurs1 != null;
                } else {
                    deselectionPossible = match.joueurVisiteurs2 != null;
                }
            }

            let genre:string = this.getGenreChampionnat();

            let championnatHomme:boolean = this.isChampionnatHomme();

            let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
                data: {club: club, anyMemberPossible:anyMemberPossible, triParPoints:true, genre:genre, championnatHomme:championnatHomme, deselectionPossible:deselectionPossible}, panelClass: "membreSelectionDialog", disableClose: false
            });

            membreSelectionRef.afterClosed().subscribe(membre => {
                if (membre!==undefined) {
                    if (indexEquipe == 1) {
                        if (indexJoueurEquipe == 1) {
                            match.joueurVisites1 = membre;
                        } else {
                            match.joueurVisites2 = membre;
                        }
                    } else {
                        if (indexJoueurEquipe == 1) {
                            match.joueurVisiteurs1 = membre;
                        } else {
                            match.joueurVisiteurs2 = membre;
                        }
                    }

                    this.sauverMatch(match);

                }
            });
        }
    }

    getGenreChampionnat():string{
        let genre:string;
        if (this.rencontre.division.championnat.categorie==CATEGORIE_CHAMPIONNAT_MESSIEURS.code
            || this.rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS.code
            || this.rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS.code){
          genre = GENRE_HOMME.code;
        } else if (this.rencontre.division.championnat.categorie==CATEGORIE_CHAMPIONNAT_DAMES.code
            || this.rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES.code
            || this.rencontre.division.championnat.categorie == CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES.code){
          genre = GENRE_FEMME.code;
        } else if (this.rencontre.division.championnat.categorie==CATEGORIE_CHAMPIONNAT_MIXTES.code){
        }
        return genre;
    }

    isChampionnatHomme():boolean {
        return this.rencontre.division.championnat.categorie==CATEGORIE_CHAMPIONNAT_MESSIEURS.code;
    }

    sauverMatch(match: Match) {
        this.matchService.updateMatch(match).subscribe();
    }

    formatDate(date: Date): string {
        if (date) {
            let dateToFormat = new Date(date);
            return addLeadingZero(dateToFormat.getDate()) + "/" + addLeadingZero(dateToFormat.getMonth() + 1) + "/" + dateToFormat.getFullYear() + " " + addLeadingZero(dateToFormat.getHours()) + ":" + addLeadingZero(dateToFormat.getMinutes());
        } else {
            return "";
        }
    }

    ouvrirDateTerrain(){
      if (this.isAdminConnected() && !this.rencontre.division.championnat.cloture){
        let dateTerrainDialogRef = this.dialog.open(DateTerrainDialog, {
            data: {rencontre: this.rencontre}, panelClass: "dateTerrainDialog", disableClose:true
        });
      }
    }

    ouvrirCommentaires(){
      if (this.isResultatsRencontreModifiables){
        let commentairesEncodeurDialogRef = this.dialog.open(CommentairesEncodeurDialog, {
            data: {rencontre: this.rencontre}, panelClass: "commentairesEncodeurDialog", disableClose:true
        });
      }
    }

    addAutorisationEncodage(){
        if (this.canAuthoriseEncodage){
            this.addAutorisation(TYPE_AUTORISATION_ENCODAGE, this.rencontre.equipeVisites.club);
        }
    }
    
    addAutorisationValidation(){
        if (this.canAuthoriseValidation){
            this.addAutorisation(TYPE_AUTORISATION_VALIDATION, this.rencontre.equipeVisiteurs.club);
        }
    }
    
    addAutorisation(type:string, club:Club){
        if (this.isUserConnected()){

            let allOrOnlyOneRef = this.dialog.open(AllOrOnlyOneDialog, {
                data: {}, panelClass: "allOrOnlyOneDialog", disableClose: false
            });

            allOrOnlyOneRef.afterClosed().subscribe(onlyOne => {
              if (onlyOne != undefined){

                let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
                    data: {club: club}, panelClass: "membreSelectionDialog", disableClose: false
                });

                membreSelectionRef.afterClosed().subscribe(membre => {
                    if (membre) {
                        let autorisationRencontre: AutorisationRencontre = new AutorisationRencontre();
                        autorisationRencontre.rencontreFk = this.rencontre.id;
                        autorisationRencontre.type=type;
                        autorisationRencontre.membre=membre;
                        this.rencontreService.addAutorisationRencontre(autorisationRencontre,!onlyOne).subscribe(autorisation => {
                            this.autorisations.push(autorisation);
                            this.autorisations.sort((a, b) => compare(a.membre.nom, b.membre.nom,true));
                        });
                    }
                });
              }
            });

        }
    }
    
    deleteAutorisation(autorisationRencontre:AutorisationRencontre){
        if (this.isUserConnected()){

            let allOrOnlyOneRef = this.dialog.open(AllOrOnlyOneDialog, {
                data: {}, panelClass: "allOrOnlyOneDialog", disableClose: false
            });

            allOrOnlyOneRef.afterClosed().subscribe(onlyOne => {
              if (onlyOne != undefined){

                this.rencontreService.deleteAutorisationRencontre(autorisationRencontre,!onlyOne).subscribe(result => {
                   if (result){
                        let index = this.autorisations.findIndex(autorisation => autorisation.id == autorisationRencontre.id);
                        if (index!=-1){
                            this.autorisations.splice(index,1);
                        }
                   }
                });

              }
            });

        }
    }

    ouvrirResultats(matchExtended: MatchExtended) {
      if (this.isResultatsRencontreModifiables){
        let resultatsDialogRef = this.dialog.open(ResultatsDialog, {
            data: {matchExtended: matchExtended}, panelClass: "resultatsDialog", disableClose:true
        });

        resultatsDialogRef.afterClosed().subscribe(matchExtended => {
            if (matchExtended) {
                this.refreshRencontre();
            }
        });
      }
    }

    refreshRencontre() {
        this.calculMatchRencontre();
        // sauver les points de la rencontre sur base des resultats des matchs
        this.rencontreService.updateRencontrePoints(this.rencontre).subscribe(result => this.refreshBooleansAndTracesAndAutorisations());
    }

    calculMatchRencontre(){
        this.rencontre.pointsVisites = null;
        this.rencontre.pointsVisiteurs = null;

        this.jeuxVisites=0;
        this.jeuxVisiteurs=0;

        this.matchs.forEach(matchExtended => {
            if (matchExtended.match.pointsVisites!=null && matchExtended.match.pointsVisiteurs!=null){
              if (this.rencontre.pointsVisites==null){
                this.rencontre.pointsVisites=0;
              }
              if (this.rencontre.pointsVisiteurs==null){
                this.rencontre.pointsVisiteurs=0;
              }
              this.rencontre.pointsVisites = this.rencontre.pointsVisites + matchExtended.match.pointsVisites;
              this.rencontre.pointsVisiteurs = this.rencontre.pointsVisiteurs + matchExtended.match.pointsVisiteurs;

              matchExtended.sets.forEach(set => {
                this.jeuxVisites = +this.jeuxVisites + +set.jeuxVisites;
                this.jeuxVisiteurs = +this.jeuxVisiteurs + +set.jeuxVisiteurs;
              });

            }
        });
    }

}

class MatchExtended {

    match: Match;
    sets: Set[] = [];

}

@Component({
    selector: 'ask-password-to-validate-dialog',
    templateUrl: './askPasswordToValidateDialog.html'
})
export class AskPasswordToValidateDialog implements OnInit {

  private rencontre:Rencontre;
  private membre:Membre;
  showFailure:boolean=false;
  password:string;

  constructor(
      private rencontreService: RencontreService,
      public dialogRef: MatDialogRef<AskPasswordToValidateDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        this.rencontre=data.rencontre;
        this.membre=data.membre;
      }

  ngOnInit() {
  }

  validate(){

        this.rencontreService.updateValiditeRencontreParAdversaire(this.rencontre, this.membre, this.password).subscribe(validity => {
            if (validity){
              this.dialogRef.close(true);
            }else{
              this.showFailure=true;
            }
        },error=> {
          console.log(error);
          this.showFailure=true;
        });

  }

  cancel(): void {
      this.dialogRef.close();
  }

}

@Component({
    selector: 'all-or-only-one-dialog',
    templateUrl: './allOrOnlyOneDialog.html'
})
export class AllOrOnlyOneDialog implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<AllOrOnlyOneDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
      }

  ngOnInit() {
  }

  selectOnlyOne(onlyOny:boolean){
      this.dialogRef.close(onlyOny);
  }

  cancel(): void {
      this.dialogRef.close();
  }

}

@Component({
    selector: 'date-terrain-dialog',
    templateUrl: './dateTerrainDialog.html'
})
export class DateTerrainDialog implements OnInit {

    terrainCtrl: FormControl = new FormControl();
    courtCtrl: FormControl = new FormControl();

    rencontre:Rencontre;
    date:Date;
    heure:number;
    minute:number;
    terrainId:number;
    courtId:number;

    terrains:Terrain[]=[];
    courts:Court[]=[];
    horairesTerrain:HoraireTerrain[]=[];

    constructor(
        private rencontreService: RencontreService,
        private terrainService: TerrainService,
        public dialogRef: MatDialogRef<DateTerrainDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.rencontre=data.rencontre;
          if (this.rencontre.dateHeureRencontre){
              this.date=new Date(this.rencontre.dateHeureRencontre);
              this.heure=this.date.getHours();
              this.minute = this.date.getMinutes();
          }
          if (this.rencontre.terrain){
              this.terrainId=this.rencontre.terrain.id;
          }
          if (this.rencontre.court){
              this.courtId=this.rencontre.court.id;
          }
        }

  ngOnInit() {
    this.terrainService.getTerrains().subscribe(terrains => this.terrains = terrains.filter(terrain => terrain.actif).sort((a, b) => compare(a.nom,b.nom,true)));
    this.terrainService.getHorairesTerrainByTypeChampionnat(this.rencontre.division.championnat.type).subscribe(horaires => this.horairesTerrain = horaires);
      if (this.terrainId){
          this.terrainService.getCourtsTerrain(this.terrainId).subscribe(courts => this.courts = courts);
      }
    }

    isCourtPrecisable():boolean{
        return this.rencontre.division.championnat.type == TYPE_CHAMPIONNAT_CRITERIUM.code && this.courts.length > 0;
    }

    changeDate(){
      if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_HIVER.code || this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_CRITERIUM.code){
        if (this.date!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => horaire.jourSemaine == (newDate.getDay()+1));
          if (horaire!=null){
            this.terrainId = horaire.terrain.id;
            this.refreshCourts();
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }else if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_ETE.code){
        if (this.date!=null && this.terrainId!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => (horaire.jourSemaine == (newDate.getDay()+1) && horaire.terrain.id == this.terrainId));
          if (horaire!=null){
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }
    }

    changeTerrain(){
      if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_ETE.code){
        if (this.date!=null && this.terrainId!=null){
          let newDate = new Date(this.date);
          let horaire = this.horairesTerrain.find(horaire => (horaire.jourSemaine == (newDate.getDay()+1) && horaire.terrain.id == this.terrainId));
          if (horaire!=null){
            this.heure=horaire.heures;
            this.minute=horaire.minutes;
          }
        }
      }
      
      this.refreshCourts();
      
    }
    
    refreshCourts(){
      this.courts = [];
      this.courtId=null;
      if (this.terrainId!=null && this.terrainId!=undefined){
          this.terrainService.getCourtsTerrain(this.terrainId).subscribe(courts => this.courts = courts.sort((a,b)=> compare(a.code,b.code,true)));
      }
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {

        if (this.terrainId){
            let selectedTerrain = this.terrains.find(terrain => terrain.id == this.terrainId);
            this.rencontre.terrain = selectedTerrain;
        }else{
            this.rencontre.terrain=null;
        }
        
        if (this.courtId){
            let selectedCourt = this.courts.find(court => court.id == this.courtId);
            this.rencontre.court = selectedCourt;
        }else{
            this.rencontre.court=null;
        }

        if (this.date!=null && this.heure!=null && this.minute!=null){
            this.rencontre.dateHeureRencontre = new Date(this.date);
            this.rencontre.dateHeureRencontre.setHours(this.heure);
            this.rencontre.dateHeureRencontre.setMinutes(this.minute);
        }else{
            this.rencontre.dateHeureRencontre=null;
        }

        this.rencontreService.updateRencontre(this.rencontre).subscribe(
        result => {
          this.dialogRef.close();
         },
        error => {
            console.log("erreur save rencontre : " + error);
         });

    }
}

@Component({
    selector: 'commentaires-encodeur-dialog',
    templateUrl: './commentairesEncodeurDialog.html'
})
export class CommentairesEncodeurDialog implements OnInit {

    rencontre:Rencontre;
    comments:string;

    constructor(
        private rencontreService: RencontreService,
        private terrainService: TerrainService,
        public dialogRef: MatDialogRef<DateTerrainDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
          this.rencontre=data.rencontre;
          this.comments = this.rencontre.commentairesEncodeur;
        }

    ngOnInit() {
    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {
        this.rencontre.commentairesEncodeur = this.comments;
        this.rencontreService.updateRencontreCommentairesEncodeur(this.rencontre).subscribe(result => this.dialogRef.close());
    }
}


@Component({
    selector: 'message-poursuite-dialog',
    templateUrl: './messagePoursuiteDialog.html'
})
export class MessagePoursuiteDialog implements OnInit {
    
    message:string;
    
    constructor(public dialogRef: MatDialogRef<MessagePoursuiteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any){
    }
    
    ngOnInit(): void {
    }
    
    cancel(){
        this.dialogRef.close();
    }
    
    save(){
        this.dialogRef.close({"message":this.message});
    }
    
}
@Component({
    selector: 'traces-rencontre-dialog',
    templateUrl: './tracesRencontreDialog.html',
    styleUrls: ['./tracesRencontreDialog.css']
})
export class TracesRencontreDialog implements OnInit {
    
    traces:Trace[]=[];
    
    constructor(public dialogRef: MatDialogRef<MessagePoursuiteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any){
        this.traces = data.traces;
    }
    
    ngOnInit(): void {
    }
    
    cancel(){
        this.dialogRef.close();
    }
    
}


@Component({
    selector: 'resultats-dialog',
    templateUrl: './resultatsDialog.html',
    styleUrls: ['./resultatsDialog.css']
})
export class ResultatsDialog {

    matchExtended: MatchExtended;

    set1JeuxVisites: number;
    set1JeuxVisiteurs: number;
    set1GagnantVisites: boolean = false;
    set1GagnantVisiteurs: boolean = false;

    set2JeuxVisites: number;
    set2JeuxVisiteurs: number;
    set2GagnantVisites: boolean = false;
    set2GagnantVisiteurs: boolean = false;

    set3JeuxVisites: number;
    set3JeuxVisiteurs: number;
    set3GagnantVisites: boolean = false;
    set3GagnantVisiteurs: boolean = false;

    showAlert: boolean = false;

    constructor(
        private matchService: MatchService,
        public dialogRef: MatDialogRef<ResultatsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.matchExtended = data.matchExtended;

        let set1 = this.matchExtended.sets.find(set => set.ordre == 1);
        if (set1) {
            this.set1JeuxVisites = set1.jeuxVisites;
            this.set1JeuxVisiteurs = set1.jeuxVisiteurs;
            if (set1.jeuxVisites == set1.jeuxVisiteurs) {
                this.set1GagnantVisites = set1.visitesGagnant == true;
                this.set1GagnantVisiteurs = set1.visitesGagnant == false;
            }
        }
        let set2 = this.matchExtended.sets.find(set => set.ordre == 2);
        if (set2) {
            this.set2JeuxVisites = set2.jeuxVisites;
            this.set2JeuxVisiteurs = set2.jeuxVisiteurs;
            if (set2.jeuxVisites == set2.jeuxVisiteurs) {
                this.set2GagnantVisites = set2.visitesGagnant == true;
                this.set2GagnantVisiteurs = set2.visitesGagnant == false;
            }
        }

        let set3 = this.matchExtended.sets.find(set => set.ordre == 3);
        if (set3) {
            this.set3JeuxVisites = set3.jeuxVisites;
            this.set3JeuxVisiteurs = set3.jeuxVisiteurs;
            if (set3.jeuxVisites == set3.jeuxVisiteurs) {
                this.set3GagnantVisites = set3.visitesGagnant == true;
                this.set3GagnantVisiteurs = set3.visitesGagnant == false;
            }
        }

    }

    cancel(): void {
        this.dialogRef.close();
    }

    save(): void {

        this.showAlert = false;
        let premierSet: boolean = false;
        let deuxiemeSet: boolean = false;
        let troisiemeSet: boolean = false;

        // Verifier la validite de l'encodage pour chaque set

        // Premier set

        if (this.set1JeuxVisites!=null) {
            if (this.set1JeuxVisiteurs==null) {
                this.showAlert = true;
            } else {
                if (('' + this.set1JeuxVisites) != '' && ('' + this.set1JeuxVisiteurs) != '') {
                  // Jeux precises pour le premier set
                  premierSet = true;
                  if (this.set1JeuxVisites == this.set1JeuxVisiteurs) {
                      if (this.set1GagnantVisites) {
                          if (this.set1GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      } else {
                          if (!this.set1GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      }
                  }
                }
            }
        } else {
            if (this.set1JeuxVisiteurs!=null) {
                this.showAlert = true;
            }
        }

        // Second set

        if (this.set2JeuxVisites!=null) {
            if (this.set2JeuxVisiteurs==null) {
                this.showAlert = true;
            } else {
                if (('' + this.set2JeuxVisites) != '' && ('' + this.set2JeuxVisiteurs) != '') {
                  // Jeux precises pour le deuxieme set
                  deuxiemeSet = true;
                  if (this.set2JeuxVisites == this.set2JeuxVisiteurs) {
                      if (this.set2GagnantVisites) {
                          if (this.set2GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      } else {
                          if (!this.set2GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      }
                  }
                }
            }
        } else {
            if (this.set2JeuxVisiteurs!=null) {
                this.showAlert = true;
            }
        }

        // Troisieme set

        if (this.set3JeuxVisites!=null) {
            if (this.set3JeuxVisiteurs==null) {
                this.showAlert = true;
            } else {
                if (('' + this.set3JeuxVisites) != '' && ('' + this.set3JeuxVisiteurs) != '') {
                  // Jeux precises pour le troisieme set
                  troisiemeSet = true;
                  if (this.set3JeuxVisites == this.set3JeuxVisiteurs) {
                      if (this.set3GagnantVisites) {
                          if (this.set3GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      } else {
                          if (!this.set3GagnantVisiteurs) {
                              this.showAlert = true;
                          }
                      }
                  }
                }
            }
        } else {
            if (this.set3JeuxVisiteurs!=null) {
                this.showAlert = true;
            }
        }

        if (!premierSet) {
            if (deuxiemeSet || troisiemeSet) {
                this.showAlert = true;
            }
        }

        if (!deuxiemeSet) {
            if (troisiemeSet) {
                this.showAlert = true;
            }
        }

        if (!this.showAlert) {

            let newSets:Set[] =[];

            if (premierSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 1;
                set.jeuxVisites = this.set1JeuxVisites;
                set.jeuxVisiteurs = this.set1JeuxVisiteurs;
                if (this.set1JeuxVisites == this.set1JeuxVisiteurs) {
                    set.visitesGagnant = this.set1GagnantVisites;
                }
                newSets.push(set);
            }

            if (deuxiemeSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 2;
                set.jeuxVisites = this.set2JeuxVisites;
                set.jeuxVisiteurs = this.set2JeuxVisiteurs;
                if (this.set2JeuxVisites == this.set2JeuxVisiteurs) {
                    set.visitesGagnant = this.set2GagnantVisites;
                }
                newSets.push(set);
            }

            if (troisiemeSet) {
                let set = new Set();
                set.match=this.matchExtended.match;
                set.ordre = 3;
                set.jeuxVisites = this.set3JeuxVisites;
                set.jeuxVisiteurs = this.set3JeuxVisiteurs;
                if (this.set3JeuxVisites == this.set3JeuxVisiteurs) {
                    set.visitesGagnant = this.set3GagnantVisites;
                }
                newSets.push(set);
            }

            this.matchService.updateMatchAndSets(this.matchExtended.match, newSets).subscribe(match => {

                this.matchExtended.sets = newSets;

                this.matchExtended.match.pointsVisites = match.pointsVisites;
                this.matchExtended.match.pointsVisiteurs = match.pointsVisiteurs;

                this.dialogRef.close(this.matchExtended);

            });

        }
    }

    isDouble() {
        return this.matchExtended.match.type == MATCH_DOUBLE;
    }

}

