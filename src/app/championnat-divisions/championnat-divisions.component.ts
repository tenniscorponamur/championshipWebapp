import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Championnat, TYPES_CHAMPIONNAT, TYPE_CHAMPIONNAT_HIVER, TypeChampionnat, TYPE_CHAMPIONNAT_ETE, CATEGORIES_CHAMPIONNAT, CategorieChampionnat, CATEGORIE_CHAMPIONNAT_MESSIEURS, CATEGORIE_CHAMPIONNAT_DAMES, CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS,CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES,CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES, getCategorieChampionnat , getTypeChampionnat} from '../championnat';
import {MatDialog, Sort} from '@angular/material';
import {ChampionnatService} from '../championnat.service';
import {compare} from '../utility';
import {ChampionnatDescriptionDialog} from '../championnat-division-detail/championnat-division-detail.component';

@Component({
    selector: 'app-championnat-divisions',
    templateUrl: './championnat-divisions.component.html',
    styleUrls: ['./championnat-divisions.component.css']
})
export class ChampionnatDivisionsComponent implements OnInit {

    typeCtrl: FormControl = new FormControl();
    categorieCtrl: FormControl = new FormControl();

    @Output() selectChampionnat = new EventEmitter<Championnat>();

    types = TYPES_CHAMPIONNAT;
    categories = CATEGORIES_CHAMPIONNAT;

    selectedType: TypeChampionnat;
    selectedCategories: CategorieChampionnat[];
    annee: string;

    actualSort:Sort;

    sortedChampionnats:Championnat[];
    filteredChampionnats:Championnat[];

    selectedChampionnat: Championnat;

    constructor(
    public dialog: MatDialog,
    private championnatService:ChampionnatService) {
        this.typeCtrl = new FormControl();
        this.categorieCtrl = new FormControl();

        this.annee = new Date().getFullYear().toString();
        //this.selectedType = TYPE_CHAMPIONNAT_ETE;
        this.selectedCategories = [CATEGORIE_CHAMPIONNAT_MESSIEURS,CATEGORIE_CHAMPIONNAT_DAMES,CATEGORIE_CHAMPIONNAT_SIMPLE_MESSIEURS,CATEGORIE_CHAMPIONNAT_DOUBLE_MESSIEURS,CATEGORIE_CHAMPIONNAT_SIMPLE_DAMES,CATEGORIE_CHAMPIONNAT_DOUBLE_DAMES,CATEGORIE_CHAMPIONNAT_MIXTES];
    }

    ngOnInit() {
      this.championnatService.getChampionnats().subscribe(championnats => {this.sortedChampionnats = championnats; this.sortData(this.actualSort);});
    }

    getTypeChampionnat(championnat:Championnat):TypeChampionnat{
        return getTypeChampionnat(championnat);
    }

    getCategorieChampionnat(championnat:Championnat):CategorieChampionnat{
        return getCategorieChampionnat(championnat);
    }

    refresh(championnat: Championnat,flush:boolean) {
        this.championnatService.getChampionnats().subscribe(championnats => {
            this.sortedChampionnats = championnats; this.sortData(this.actualSort);
            this.selectedChampionnat = this.sortedChampionnats.find(championnatInList => championnatInList.id == championnat.id);
          });
    }

  sortData(sort: Sort) {
    this.actualSort=sort;
    const data = this.sortedChampionnats.slice();
    if (sort){
        if (!sort.active || sort.direction == '') {
          this.sortedChampionnats = data;
          return;
        }

        this.sortedChampionnats = data.sort((a, b) => {
          let isAsc = sort.direction == 'asc';
          switch (sort.active) {
            case 'annee': return compare(a.annee, b.annee, isAsc);
            case 'type': return compare(a.type, b.type, isAsc);
            case 'categorie': return compare(a.categorie, b.categorie, isAsc);
            default: return 0;
          }
        });
    }
    this.filtre(this.annee,this.selectedType,this.selectedCategories);
  }

    filtre(annee: string,selectedType:TypeChampionnat,selectedCategories:CategorieChampionnat[]): void {

        this.filteredChampionnats = this.sortedChampionnats;

        if (annee != null && annee != undefined && annee.trim()!='') {

            this.filteredChampionnats = this.filteredChampionnats.filter(championnat =>
                championnat.annee.includes(annee)
            )

        }

        if (selectedType){
            this.filteredChampionnats = this.filteredChampionnats.filter(({type}) => {
                return selectedType.code==type});
        }

        if (selectedCategories && selectedCategories.length > 0){
            this.filteredChampionnats = this.filteredChampionnats.filter(({categorie}) => {

                // Workaround car je ne parviens pas a faire en sorte que la methode includes retourne true
                return selectedCategories.some(selectedCategorie => {
                    if (categorie){
                        return selectedCategorie.code==categorie;
                    }
                    return false;
                })});
        }

    }

    nouveauChampionnat(){
        let nouveauChampionnat: Championnat = new Championnat();
        nouveauChampionnat.annee = new Date().getFullYear().toString();

        let championnatDescriptionDialogRef = this.dialog.open(ChampionnatDescriptionDialog, {
            data: { championnat: nouveauChampionnat }, panelClass: "championnatDescriptionDialog", disableClose:true
        });

        championnatDescriptionDialogRef.afterClosed().subscribe(result => {
            if (result){
                this.selectedChampionnat = result;
                this.sortedChampionnats.push(this.selectedChampionnat);
                this.sortData(this.actualSort);
                this.signalSelection();
            }
        });
    }

    ouvrirChampionnat(championnat:Championnat):void{
        this.selectedChampionnat = championnat;
        this.signalSelection();
    }

    deleteChampionnat(championnatToDelete : Championnat){
        this.championnatService.deleteChampionnat(championnatToDelete).subscribe(result => {
            this.selectedChampionnat = null;

            let indexInFiltered = this.filteredChampionnats.findIndex(championnat => championnat.id == championnatToDelete.id);
            if (indexInFiltered!=-1){
                this.filteredChampionnats.splice(indexInFiltered,1);
            }
            let indexInSorted = this.sortedChampionnats.findIndex(championnat => championnat.id == championnatToDelete.id);
            if (indexInSorted!=-1){
                this.sortedChampionnats.splice(indexInSorted,1);
            }

            this.signalSelection();
        });
    }

    signalSelection(){
        //Appel au parent pour le refresh des autres enfants
        this.selectChampionnat.emit(this.selectedChampionnat);
    }

}
