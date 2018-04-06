import { Genre } from './genre';

export class Membre {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  actif: boolean;
  genre: Genre;
}
