export class Genre {
  code: string;
  libelle: string;
}

export const GENRE_HOMME : Genre = { code: 'H', libelle: 'Homme'};
export const GENRE_FEMME : Genre = { code: 'F', libelle: 'Femme'};

export const GENRES : Genre[] = [ GENRE_HOMME, GENRE_FEMME];

