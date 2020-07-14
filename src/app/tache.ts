import {Membre} from "./membre";
import {User} from "./user";

export class Tache {

  id: number;
  dateDemande:Date;
  typeTache:string;
  demandeur:Membre;
  membre:Membre;

  pointsCorpo:number;
  desactivationMembre:boolean;
  reactivationMembre:boolean;
  commentairesDemande:string;

  dateTraitement:Date;
  agentTraitant:User;
  validationTraitement:boolean;
  refusTraitement:boolean;
  commentairesRefus:string;

}

export function getTypeTacheAsString(tache:Tache){
  if (tache.typeTache=="NOUVEAU_MEMBRE"){
    return "Nouveau membre";
  }else if (tache.typeTache=="DESACTIVATION_MEMBRE"){
    return "Désactivation d'un membre";
  }else if (tache.typeTache=="REACTIVATION_MEMBRE"){
    return "Réactivation d'un membre";
  }else if (tache.typeTache=="CHANGEMENT_POINTS_CORPO"){
    return "Modifications points Corpo";
  }
  return "Type de tâche inconnu";
}
