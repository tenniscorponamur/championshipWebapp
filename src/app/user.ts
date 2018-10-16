import {Membre} from "./membre";

export class User {
  id: number;
  username:string;
  nom: string;
  prenom: string;
  roles:string[];
  admin:boolean;
  membre:Membre;
}
