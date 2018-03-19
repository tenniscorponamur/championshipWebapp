import { Membre } from './membre';
import { Genre, GENRE_HOMME, GENRE_FEMME} from './genre';

export const MEMBRES: Membre[] = [
  { id: 1, nom: 'Calay', prenom:'Fabrice', 'genre':GENRE_HOMME },
  { id: 2, nom: 'Beauthier', prenom:'Charlotte', 'genre':GENRE_FEMME },
  { id: 3, nom: 'Marot', prenom:'Virginie', 'genre':GENRE_FEMME },
];
