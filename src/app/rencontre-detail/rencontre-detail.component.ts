import {Component, Inject, OnInit, Input} from '@angular/core';
import {formatDate} from '@angular/common';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Rencontre, AutorisationRencontre, TYPE_AUTORISATION_ENCODAGE,TYPE_AUTORISATION_VALIDATION} from '../rencontre';
import {ChampionnatDetailComponent} from '../championnats/championnat-detail.component';
import {compare, addLeadingZero, getDate} from '../utility';
import {MatchService} from '../match.service';
import {RencontreService} from '../rencontre.service';
import {ClassementMembreService} from '../classement-membre.service';
import {AuthenticationService} from '../authentication.service';
import {Match, MATCH_SIMPLE, MATCH_DOUBLE} from '../match';
import {MembreService} from '../membre.service';
import {SetService} from '../set.service';
import {TerrainService} from '../terrain.service';
import {Membre} from '../membre';
import {MembreSelectionComponent} from '../membre-selection/membre-selection.component';
import {Club} from '../club';
import {Set} from '../set';
import {Terrain, HoraireTerrain, Court} from '../terrain';
import {Equipe} from '../equipe';
import {Championnat,getCategorieChampionnat,CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES, CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS, TYPE_CHAMPIONNAT_HIVER, TYPE_CHAMPIONNAT_ETE, TYPE_CHAMPIONNAT_CRITERIUM, TYPE_CHAMPIONNAT_COUPE_HIVER} from '../championnat';
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
    rappelEnvoye:boolean=true;

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
    }

    private _rencontre: Rencontre;
    jeuxVisites:number;
    jeuxVisiteurs:number;
    canAuthoriseEncodage:boolean=false;
    canAuthoriseValidation:boolean=false;
    isResultatsRencontreModifiables:boolean=false;
    isForfaitPossible:boolean=false;
    isResultatsCloturables:boolean=false;
    isPoursuiteEncodagePossible:boolean=false;
    isEtatValidable:boolean=false;
    isValidable:boolean=false;

    @Input()
    set rencontre(rencontre: Rencontre) {
        this._rencontre = rencontre;
        this.refreshBooleansAndTracesAndAutorisations();
        this.initMapEquivalence();
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

    getSocialMediaText(rencontre:Rencontre){
      let date = getDate(this.rencontre.dateHeureRencontre);
      return "Rencontre " + getCategorieChampionnat(rencontre.division.championnat).libelle
            + " : "
            + rencontre.equipeVisites.codeAlphabetique
            + " - "
            + rencontre.equipeVisiteurs.codeAlphabetique
            + " ce "
            + date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()
            + " à "
            + date.getHours() + "h" + date.getMinutes()
            + " au "
            + (rencontre.terrain!=null?rencontre.terrain.nom:"")
    }

    ouvrirGoogleAgenda(){
        this.rencontreService.getLienGoogleCalendar(this.rencontre).subscribe(googleCalendar => {
          window.open(googleCalendar.link);
        });
    }

    echangeEquipePossible(){
      return this.isAdminConnected() && ((this.rencontre.pointsVisites==null || this.rencontre.pointsVisites==0) && (this.rencontre.pointsVisiteurs==null || this.rencontre.pointsVisiteurs==0));
    }

    switchTeams(){
        if (this.rencontre){
          if (this.echangeEquipePossible()){
            this.inverserEquipes();
            this.rencontreService.updateRencontre(this.rencontre).subscribe(
            result => {
             },
            error => {
              this.inverserEquipes();
             });
          }
        }
    }

  inverserEquipes(){

    let oldEquipeVisites = this.rencontre.equipeVisites;
    this.rencontre.equipeVisites = this.rencontre.equipeVisiteurs;
    this.rencontre.equipeVisiteurs = oldEquipeVisites;
    //S'il s'agit d'un championnat ETE, on va switcher les terrains
    if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_ETE.code){
      if (this.rencontre.equipeVisites.terrain){
          this.rencontre.terrain = this.rencontre.equipeVisites.terrain;
      }else{
          this.rencontre.terrain = null;
      }
    }
  }

    verificationPoints(){
      return true;
    }

    isJoueursManquants(){
      if (this.isResultatsCloturables || this.isPoursuiteEncodagePossible || this.isEtatValidable || this.isValidable || this.rencontre.valide){
        let joueurManquant:boolean = false;
        this.matchs.forEach(match => {
          if (MATCH_SIMPLE == match.match.type){
              if (match.match.joueurVisites1==null || match.match.joueurVisiteurs1==null){
                joueurManquant=true;
              }
          }
          if (MATCH_DOUBLE == match.match.type){
              if (match.match.joueurVisites1==null || match.match.joueurVisiteurs1==null || match.match.joueurVisites2==null || match.match.joueurVisiteurs2==null){
                joueurManquant=true;
              }
          }
        });
        return joueurManquant;
      }
      return false;
    }

    forfait(forfaitVisiteurs:boolean){

      // Faire appel a un service pour declarer le forfait
      // Faire ensuite un refresh de la rencontre (et de ses statuts) et un refresh des matchs

      if (this.isForfaitPossible){
        this.rencontreService.forfaitRencontre(this.rencontre,forfaitVisiteurs).subscribe(rencontre => {
          this.rencontre = rencontre;
        });
      }

    }

    forceValidation(){

      // Faire appel a un service pour forcer une validation d'administrateur (match annule et aucun point attribue aux equipes)

      if (this.isForfaitPossible){
          this.rencontreService.forceValidation(this.rencontre).subscribe(validity => {
              this.rencontre.resultatsEncodes = validity;
              this.rencontre.valide = validity;
              this.refreshBooleansAndTracesAndAutorisations();
          },error=> console.log(error));
      }

    }

    envoiRappel() {
        if (this.isAdminConnected() && !this.rencontre.resultatsEncodes){
           this.rencontreService.envoiRappel(this.rencontre).subscribe(dateRappel => {
                      if (dateRappel!=null){
                        this.rencontre.dateRappel = dateRappel;
                      }
                  },error=> console.log(error));
        }
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

  getPointsCorpo(match:MatchExtended,indexEquipe: number, indexJoueurEquipe: number):number{

    // Recuperer le classement du membre a la date de la rencontre
    // Information connue dans le matchExtended au chargement de ce dernier
    // Recuperer l'information lors de la selection d'un joueur egalement, ou reinitialiser le cas echeant

    let points = null;
    let membre = null;

    if (indexEquipe == 1) {
        if (indexJoueurEquipe == 1) {
            points = match.pointsJoueurVisites1;
            membre = match.match.joueurVisites1;
        } else {
            points = match.pointsJoueurVisites2;
            membre = match.match.joueurVisites2;
        }
    } else {
        if (indexJoueurEquipe == 1) {
            points = match.pointsJoueurVisiteurs1;
            membre = match.match.joueurVisiteurs1;
        } else {
            points = match.pointsJoueurVisiteurs2;
            membre = match.match.joueurVisiteurs2;
        }
    }

    if (membre!=null && points != null){
      if (this.isChampionnatHomme() && this.mapEquivalence!=null && membre.genre == GENRE_FEMME.code){
        return this.mapEquivalence[points];
      }else{
        return points;
      }
    }
    return null;
  }

    pointsSimplesVisites():number{

      let pointsSimples: number = 0;
      this.matchs.forEach(match => {
        if (MATCH_SIMPLE == match.match.type){
          if (match.match.joueurVisites1!=null){
            pointsSimples = pointsSimples + this.getPointsCorpo(match,1,1);
          }
        }
      });
      return pointsSimples;
    }

    pointsSimplesVisiteurs():number{
      let pointsSimples: number = 0;
      this.matchs.forEach(match => {
        if (MATCH_SIMPLE == match.match.type){
          if (match.match.joueurVisiteurs1!=null){
            pointsSimples = pointsSimples + this.getPointsCorpo(match,2,1);
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
            if (match.match.joueurVisites1!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match,1,1);
            }
            if (match.match.joueurVisites2!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match,1,2);
            }
          }
        });
      }else{
        let pointsDeuxDoubles = 0;
        let cpt = 0;
        // Sinon on fait deux par deux et on prend le maximum pour afficher l'alerte
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisites1!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match,1,1);
            }
            if (match.match.joueurVisites2!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match,1,2);
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
            if (match.match.joueurVisiteurs1!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match,2,1);
            }
            if (match.match.joueurVisiteurs2!=null){
              pointsDoubles = pointsDoubles + this.getPointsCorpo(match,2,2);
            }
          }
        });
      }else{
        let pointsDeuxDoubles = 0;
        let cpt = 0;
        // Sinon on fait deux par deux et on prend le maximum pour afficher l'alerte
        this.matchs.forEach(match => {
          if (MATCH_DOUBLE == match.match.type){
            if (match.match.joueurVisiteurs1!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match,2,1);
            }
            if (match.match.joueurVisiteurs2!=null){
              pointsDeuxDoubles = pointsDeuxDoubles + this.getPointsCorpo(match,2,2);
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

                    this.initPointsJoueurs(matchExtended);

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


    initMapEquivalence(){
      this.classementMembreService.correspondanceEchelleCorpo(this.rencontre.dateHeureRencontre).subscribe(mapEquivalence => this.mapEquivalence = mapEquivalence);
    }

    initPointsJoueurs(matchExtended:MatchExtended){

        // Pour chaque joueur du match defini, recuperer les points
        if (matchExtended.match.joueurVisites1 != null){
          this.classementMembreService.getPointsCorpoByMembreAndDate(matchExtended.match.joueurVisites1.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
            matchExtended.pointsJoueurVisites1 = pointsCorpo;
          });
        }

        if (matchExtended.match.joueurVisites2 != null){
          this.classementMembreService.getPointsCorpoByMembreAndDate(matchExtended.match.joueurVisites2.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
            matchExtended.pointsJoueurVisites2 = pointsCorpo;
          });
        }

        if (matchExtended.match.joueurVisiteurs1 != null){
          this.classementMembreService.getPointsCorpoByMembreAndDate(matchExtended.match.joueurVisiteurs1.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
            matchExtended.pointsJoueurVisiteurs1 = pointsCorpo;
          });
        }

        if (matchExtended.match.joueurVisiteurs2 != null){
          this.classementMembreService.getPointsCorpoByMembreAndDate(matchExtended.match.joueurVisiteurs2.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
            matchExtended.pointsJoueurVisiteurs2 = pointsCorpo;
          });
        }
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
            this.rencontreService.isForfaitPossible(this.rencontre).subscribe(result => this.isForfaitPossible = result);
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

    getMembresARetirer(match:Match, indexEquipe: number, indexJoueurEquipe: number):Membre[]{

      // Pour le match concerne, ne pas retirer le joueur potentiellement deja selectionne
      let membresARetirer = [];

      this.matchs.forEach(otherMatch => {

        if (match.type==MATCH_SIMPLE && otherMatch.match.type == MATCH_SIMPLE){

          // Pour les simples, un seul simple par rencontre par joueur. On retire tous les autres joueurs deja selectionnes dans les autres matchs

          if (otherMatch.match.id != match.id){
            // Pour les simples, on va retirer tous les joueurs deja precises de la liste
              if (otherMatch.match.joueurVisites1){
                membresARetirer.push(otherMatch.match.joueurVisites1);
              }
              if (otherMatch.match.joueurVisiteurs1){
                membresARetirer.push(otherMatch.match.joueurVisiteurs1);
              }
          }else{
            // Retirer le joueur en face s'il existe
            if (indexEquipe == 1) {
              if (otherMatch.match.joueurVisiteurs1){
                membresARetirer.push(otherMatch.match.joueurVisiteurs1);
              }
            }else{
              if (otherMatch.match.joueurVisites1){
                membresARetirer.push(otherMatch.match.joueurVisites1);
              }
            }
          }

        }

        if (match.type==MATCH_DOUBLE && otherMatch.match.type == MATCH_DOUBLE){
          // Pour les doubles, ca depend du type de championnat. En coupe d'hiver, les joueurs vont jouer 2 doubles (4 matchs)
          // S'il s'agit du championnat ete/hiver, on va retirer tous les joueurs deja selectionnes dans les autres rencontres (1 seul double par joueur)

          //TODO : activer le meme principe pour la coupe d'hiver --> un peu touchy car c'est bloquant s'il y a un souci et les doubles vont par paire dans ce type de championnat

          if (this.rencontre.division.championnat.type!=TYPE_CHAMPIONNAT_COUPE_HIVER.code){
            // S'il s'agit d'un match different, on retire tous les joueurs deja precises
            if (otherMatch.match.id != match.id){

              // retrait des joueurs 1 et 2 des 2 equipes

              if (otherMatch.match.joueurVisites1){
                membresARetirer.push(otherMatch.match.joueurVisites1);
              }
              if (otherMatch.match.joueurVisites2){
                membresARetirer.push(otherMatch.match.joueurVisites2);
              }
              if (otherMatch.match.joueurVisiteurs1){
                membresARetirer.push(otherMatch.match.joueurVisiteurs1);
              }
              if (otherMatch.match.joueurVisiteurs2){
                membresARetirer.push(otherMatch.match.joueurVisiteurs2);
              }
            }else{

              // S'il s'agit du match sur lequel on se trouve, on retire les autres joueurs deja precises
              // Oui, on pourrait coder plus "propre" mais de cette maniere, il est plus facile de comprendre ce que l'on fait

              if (indexEquipe == 1) {
                if (indexJoueurEquipe == 1) {
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }else{
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }
              }else{
                if (indexJoueurEquipe == 1) {
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }else{
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                }
              }
            }
          }else{

            // Pour la coupe d'hiver, on va juste regarder ce qu'il se passe sur le meme match

            if (otherMatch.match.id == match.id){
              if (indexEquipe == 1) {
                if (indexJoueurEquipe == 1) {
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }else{
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }
              }else{
                if (indexJoueurEquipe == 1) {
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs2){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs2);
                  }
                }else{
                  if (otherMatch.match.joueurVisites1){
                    membresARetirer.push(otherMatch.match.joueurVisites1);
                  }
                  if (otherMatch.match.joueurVisites2){
                    membresARetirer.push(otherMatch.match.joueurVisites2);
                  }
                  if (otherMatch.match.joueurVisiteurs1){
                    membresARetirer.push(otherMatch.match.joueurVisiteurs1);
                  }
                }
              }
            }

          }

        }

      });

      return membresARetirer;
    }

    selectionnerJoueur(match: MatchExtended, indexEquipe: number, indexJoueurEquipe: number): void {
        if (this.isResultatsRencontreModifiables){
            let equipe;
            let club;
            let anyMemberPossible:boolean=false;
            if (indexEquipe == 1) {
                equipe = this.rencontre.equipeVisites;
                club = this.rencontre.equipeVisites.club;
                anyMemberPossible = this.isAdminConnected() || this.rencontre.equipeVisites.hybride;
            } else {
                equipe = this.rencontre.equipeVisiteurs;
                club = this.rencontre.equipeVisiteurs.club;
                anyMemberPossible = this.isAdminConnected() || this.rencontre.equipeVisiteurs.hybride;
            }

            let deselectionPossible:boolean = false;
            if (indexEquipe == 1) {
                if (indexJoueurEquipe == 1) {
                    deselectionPossible = match.match.joueurVisites1 != null;
                } else {
                    deselectionPossible = match.match.joueurVisites2 != null;
                }
            }else{
                if (indexJoueurEquipe == 1) {
                    deselectionPossible = match.match.joueurVisiteurs1 != null;
                } else {
                    deselectionPossible = match.match.joueurVisiteurs2 != null;
                }
            }

            let genre:string = this.getGenreChampionnat();

            let championnatHomme:boolean = this.isChampionnatHomme();

            let membresARetirer:Membre[]=this.getMembresARetirer(match.match, indexEquipe, indexJoueurEquipe);

            let membreSelectionRef = this.dialog.open(MembreSelectionComponent, {
                data: {club: club, equipe:equipe, anyMemberPossible:anyMemberPossible, membresARetirer:membresARetirer, genre:genre, dateRencontre: this.rencontre.dateHeureRencontre, championnatHomme:championnatHomme, deselectionPossible:deselectionPossible}, panelClass: "membreSelectionDialog", disableClose: false
            });

            membreSelectionRef.afterClosed().subscribe(membre => {
                if (membre!==undefined) {

                    // Charger les classements a la date de la rencontre dans le matchExtended pour chaque joueur
                    // Attention car le membre peut être null --> adapter les points en consequence

                    if (indexEquipe == 1) {
                        if (indexJoueurEquipe == 1) {
                            match.match.joueurVisites1 = membre;
                            if (membre!=null && this.rencontre.dateHeureRencontre!=null){
                              this.classementMembreService.getPointsCorpoByMembreAndDate(membre.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
                                match.pointsJoueurVisites1 = pointsCorpo;
                              });
                            }else{
                              match.pointsJoueurVisites1 = null;
                            }
                        } else {
                            match.match.joueurVisites2 = membre;
                            if (membre!=null && this.rencontre.dateHeureRencontre!=null){
                              this.classementMembreService.getPointsCorpoByMembreAndDate(membre.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
                                match.pointsJoueurVisites2 = pointsCorpo;
                              });
                            }else{
                              match.pointsJoueurVisites2 = null;
                            }
                        }
                    } else {
                        if (indexJoueurEquipe == 1) {
                            match.match.joueurVisiteurs1 = membre;
                            if (membre!=null && this.rencontre.dateHeureRencontre!=null){
                              this.classementMembreService.getPointsCorpoByMembreAndDate(membre.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
                                match.pointsJoueurVisiteurs1 = pointsCorpo;
                              });
                            }else{
                              match.pointsJoueurVisiteurs1 = null;
                            }
                        } else {
                            match.match.joueurVisiteurs2 = membre;
                            if (membre!=null && this.rencontre.dateHeureRencontre!=null){
                              this.classementMembreService.getPointsCorpoByMembreAndDate(membre.id,this.rencontre.dateHeureRencontre).subscribe(pointsCorpo => {
                                match.pointsJoueurVisiteurs2 = pointsCorpo;
                              });
                            }else{
                              match.pointsJoueurVisiteurs2 = null;
                            }
                        }
                    }

                    this.sauverMatch(match.match);

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

    ouvrirDateTerrain(){
      if (this.isAdminConnected() && !this.rencontre.division.championnat.cloture){
        let dateTerrainDialogRef = this.dialog.open(DateTerrainDialog, {
            data: {rencontre: this.rencontre}, panelClass: "dateTerrainDialog", disableClose:true
        });

        dateTerrainDialogRef.afterClosed().subscribe(result => {
            this.initMapEquivalence();
            this.matchs.forEach(matchExtended => this.initPointsJoueurs(matchExtended));
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

    ouvrirInfosTerrain(terrain:Terrain){
      let terrainDetailRef = this.dialog.open(TerrainDetailDialog, {
          data: {terrain: terrain}, panelClass: "terrainDetailDialog", disableClose:false
      });
    }

    ouvrirInfosCapitaine(capitaine:Membre){
      if (this.isUserConnected()){
        let capitaineDetailRef = this.dialog.open(CapitaineDetailDialog, {
            data: {capitaine: capitaine}, panelClass: "capitaineDetailDialog", disableClose:false
        });
      }
    }

    showInfosEquipeHybride(){

        let capitaineDetailRef = this.dialog.open(InfoDialog, {
            data: {title:"Equipe hybride", informations: "Possibilité de faire jouer un membre d'une autre corporation"}, panelClass: "infoDialog", disableClose:false
        });
    }

}

class MatchExtended {

    match: Match;
    pointsJoueurVisites1:number;
    pointsJoueurVisites2:number;
    pointsJoueurVisiteurs1:number;
    pointsJoueurVisiteurs2:number;
    sets: Set[] = [];

}

@Component({
    selector: 'terrain-detail-dialog',
    templateUrl: './terrainDetailDialog.html'
})
export class TerrainDetailDialog implements OnInit {

  terrain:Terrain;

  constructor(
      public dialogRef: MatDialogRef<TerrainDetailDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        this.terrain=data.terrain;
      }

  ngOnInit() {
  }

  cancel(){
    this.dialogRef.close();
  }

}

@Component({
    selector: 'capitaine-detail-dialog',
    templateUrl: './capitaineDetailDialog.html'
})
export class CapitaineDetailDialog implements OnInit {

  capitaine:Membre;

  constructor(
      public dialogRef: MatDialogRef<CapitaineDetailDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        this.capitaine=data.capitaine;
      }

  ngOnInit() {
  }

  cancel(){
    this.dialogRef.close();
  }

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
    selector: 'info-dialog',
    templateUrl: './infoDialog.html'
})
export class InfoDialog {

  title:string;
  informations:string;

  constructor(
      public dialogRef: MatDialogRef<InfoDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        this.title=data.title;
        this.informations=data.informations;
      }

  cancel(){
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
              //console.log(this.rencontre.dateHeureRencontre);
              //console.log(new Date(this.rencontre.dateHeureRencontre));
              //console.log(getDate(this.rencontre.dateHeureRencontre));
              this.date=getDate(this.rencontre.dateHeureRencontre);
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

      /*** Retrait du choix du terrain sur base de la date dans le championnat hiver car plusieurs terrains dispos le meme jour

      if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_CRITERIUM.code){
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
      }else
      */

      if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_HIVER.code || this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_ETE.code){
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
      if (this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_HIVER.code || this.rencontre.division.championnat.type==TYPE_CHAMPIONNAT_ETE.code){
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
          this.dialogRef.close(true);
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
        public dialogRef: MatDialogRef<CommentairesEncodeurDialog>,
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
export class ResultatsDialog implements OnInit {

    matchExtended: MatchExtended;

    _setUnique: boolean = false;

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


    nbJeuxMax:number=6;
    showAlert: boolean = false;

    constructor(
        private matchService: MatchService,
        public dialogRef: MatDialogRef<ResultatsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.matchExtended = data.matchExtended;

        this._setUnique = this.matchExtended.match.setUnique;

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

    ngOnInit(): void {
        this.matchService.getNbJeuxMax(this.matchExtended.match).subscribe(nbJeux => {
          this.nbJeuxMax = nbJeux;
        });

    }

    showNumber(value:number){
      return value<=this.nbJeuxMax;
    }

    showSetUniqueCheckbox(){
      //return this.matchExtended.match.rencontre.division.championnat.type!=TYPE_CHAMPIONNAT_ETE.code;
      return true;
    }

    set1Changed(){
      if (this._setUnique){
        this.set2JeuxVisites=this.set1JeuxVisites;
        this.set2JeuxVisiteurs=this.set1JeuxVisiteurs;
        this.set2GagnantVisites=this.set1GagnantVisites;
        this.set2GagnantVisiteurs=this.set1GagnantVisiteurs;
      }
    }

    setUniqueChanged(){
      if (this._setUnique){
        this.set2JeuxVisites=this.set1JeuxVisites;
        this.set2JeuxVisiteurs=this.set1JeuxVisiteurs;
        this.set2GagnantVisites=this.set1GagnantVisites;
        this.set2GagnantVisiteurs=this.set1GagnantVisiteurs;
      }else{
        this.set2JeuxVisites=null;
        this.set2JeuxVisiteurs=null;
        this.set2GagnantVisites=false;
        this.set2GagnantVisiteurs=false;
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

            this.matchExtended.match.setUnique=this._setUnique;

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

