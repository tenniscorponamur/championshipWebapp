import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {environment} from '../environments/environment';
import {AuthenticationService} from './authentication.service';
import {Rencontre, AutorisationRencontre} from './rencontre';
import {Membre} from './membre';
import {formatDateInString} from './utility';
import {EnvironmentService} from './environment.service';

@Injectable()
export class RencontreService {

    constructor(private http: HttpClient, private environmentService:EnvironmentService, private authenticationService: AuthenticationService) {}

    getRencontres(divisionId: number,pouleId:number,equipeId:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontres?divisionId=" + divisionId+(pouleId!=null?("&pouleId="+pouleId):"")+(equipeId!=null?("&equipeId="+equipeId):""));
    }

    getRencontresByClub(championnatId: number,clubId:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontresByClub?championnatId=" + championnatId + "&clubId="+clubId);
    }

    getRencontresByDate(date:Date): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontres/byDate?date=" + formatDateInString(date));
    }

    getRencontresCriteriumByAnnee(annee:string): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontres/criterium?annee=" + annee);
    }

    getLastResults(maxNumberOfResults:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontres/last?numberOfResults=" + maxNumberOfResults);
    }

    getNextMeetings(maxNumberOfResults:number): Observable<Rencontre[]> {
        return this.http.get<Rencontre[]>(this.environmentService.getPublicApiUrl() + "/rencontres/next?numberOfResults=" + maxNumberOfResults);
    }

    getRencontresToComplete(): Observable<Rencontre[]> {
      return this.http.get<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/toComplete", this.authenticationService.getPrivateApiHttpOptions());
    }

    getRencontresToValidate(): Observable<Rencontre[]> {
      return this.http.get<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/toValidate", this.authenticationService.getPrivateApiHttpOptions());
    }

    getLienGoogleCalendar(rencontre:Rencontre):Observable<any> {
        return this.http.get<any>(this.environmentService.getPublicApiUrl() + "/rencontre/" + rencontre.id + "/lienGoogleCalendar");
    }

    isResultatsRencontreModifiables(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isResultatsModifiables", this.authenticationService.getPrivateApiHttpOptions());
    }

    isForfaitPossible(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isForfaitPossible", this.authenticationService.getPrivateApiHttpOptions());
    }

    isResultatsCloturables(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isResultatsCloturables", this.authenticationService.getPrivateApiHttpOptions());
    }

    isPoursuiteEncodagePossible(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isPoursuiteEncodagePossible", this.authenticationService.getPrivateApiHttpOptions());
    }

    isEtatValidable(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isEtatValidable", this.authenticationService.getPrivateApiHttpOptions());
    }

    isValidable(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/isValidable", this.authenticationService.getPrivateApiHttpOptions());
    }

    createRencontre(rencontre: Rencontre) {
        return this.http.post<Rencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateRencontre(rencontre: Rencontre) {
        return this.http.put<Rencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateRencontrePoints(rencontre: Rencontre) {
        return this.http.put<Rencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre/points", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateRencontreCommentairesEncodeur(rencontre: Rencontre) {
        return this.http.put<Rencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre/commentairesEncodeur", rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    forfaitRencontre(rencontre:Rencontre, forfaitVisiteurs:boolean){
      return this.http.put<Rencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre/forfait?forfaitVisiteurs=" + forfaitVisiteurs, rencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateResultatsEncodesRencontre(rencontre:Rencontre, resultatsEncodes:boolean, message:string){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/resultatsEncodes?resultatsEncodes=" + resultatsEncodes, message, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeRencontre(rencontre:Rencontre, validite:boolean, message:string){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/validite?validite=" + validite, message, this.authenticationService.getPrivateApiHttpOptions());
    }

    updateValiditeRencontreParAdversaire(rencontre:Rencontre, adversaire:Membre, password:string){
        return this.http.put<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/validiteParAdversaire?adversaireId=" + adversaire.id, password , this.authenticationService.getPrivateApiHttpOptions());
    }

    getAutorisations(rencontre:Rencontre): Observable<AutorisationRencontre[]> {
        return this.http.get<AutorisationRencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/autorisations", this.authenticationService.getPrivateApiHttpOptions());
    }

    canAuthoriseEncodage(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/canAuthoriseEncodage", this.authenticationService.getPrivateApiHttpOptions());
    }

    canAuthoriseValidation(rencontre:Rencontre) {
        return this.http.get<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + rencontre.id + "/canAuthoriseValidation", this.authenticationService.getPrivateApiHttpOptions());
    }

    addAutorisationRencontre(autorisationRencontre:AutorisationRencontre,allOthersOfTheTeam:boolean){
        return this.http.post<AutorisationRencontre>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + autorisationRencontre.rencontreFk + "/autorisation?allOthersOfTheTeam="+allOthersOfTheTeam, autorisationRencontre, this.authenticationService.getPrivateApiHttpOptions());
    }

    deleteAutorisationRencontre(autorisationRencontre:AutorisationRencontre,allOthersOfTheTeam:boolean){
        return this.http.delete<boolean>(this.environmentService.getPrivateApiUrl() + "/rencontre/" + autorisationRencontre.rencontreFk + "/autorisation?autorisationRencontreId=" + autorisationRencontre.id+"&allOthersOfTheTeam="+allOthersOfTheTeam, this.authenticationService.getPrivateApiHttpOptions());
    }

    creerCalendrier(championnatId: number){
        return this.http.post<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/calendrier?championnatId=" + championnatId, null, this.authenticationService.getPrivateApiHttpOptions());
    }

    refreshCalendrier(championnatId: number){
        return this.http.put<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/calendrier?championnatId=" + championnatId, null, this.authenticationService.getPrivateApiHttpOptions());
    }

    supprimerCalendrier(championnatId: number){
        return this.http.delete<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/calendrier?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    getInterseries(championnatId: number) {
      return this.http.get<Rencontre[]>(this.environmentService.getPrivateApiUrl() + "/rencontres/interseries?championnatId=" + championnatId, this.authenticationService.getPrivateApiHttpOptions());
    }

    getCalendrier(championnatId: number, excelFile:boolean){
      let options = this.authenticationService.getPrivateApiHttpOptions();
      options["responseType"] = "blob";
      return this.http.get(this.environmentService.getPublicApiUrl() + "/rencontres/calendrier?championnatId=" + championnatId + "&excel="+excelFile,options);
    }

}
