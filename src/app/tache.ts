import {Membre} from "./membre";
import {User} from "./user";

export class Tache {

  id: number;
  dateDemande:Date;
  typeTache:string;
  demandeur:Membre;
  membre:Membre;

  numeroAft:string;
  codeClassementAft:number;
  pointsCorpo:number;
  desactivationMembre:boolean;
  reactivationMembre:boolean;
  commentairesDemande:string;

  dateTraitement:Date;
  agentTraitant:User;
  validationTraitement:boolean;
  refusTraitement:boolean;
  commentairesRefus:string;

  markAsRead:boolean;
  archived:boolean;

}

export const TYPE_TACHE_NOUVEAU_MEMBRE: string = "NOUVEAU_MEMBRE";
export const TYPE_TACHE_DESACTIVATION_MEMBRE: string = "DESACTIVATION_MEMBRE";
export const TYPE_TACHE_REACTIVATION_MEMBRE: string = "REACTIVATION_MEMBRE";
export const TYPE_TACHE_CHANGEMENT_POINTS: string = "CHANGEMENT_POINTS_CORPO";

export function getTypeTacheAsString(tache:Tache){
  if (tache.typeTache==TYPE_TACHE_NOUVEAU_MEMBRE){
    return "Nouveau membre";
  }else if (tache.typeTache==TYPE_TACHE_DESACTIVATION_MEMBRE){
    return "Désactivation d'un membre";
  }else if (tache.typeTache==TYPE_TACHE_REACTIVATION_MEMBRE){
    return "Réactivation d'un membre";
  }else if (tache.typeTache==TYPE_TACHE_CHANGEMENT_POINTS){
    return "Modifications points Corpo";
  }
  return "Type de tâche inconnu";
}
