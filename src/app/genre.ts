export class Genre {
  code: string;
  libelle: string;
}

export const GENRE_HOMME : Genre = { code: 'HOMME', libelle: 'Homme'};
export const GENRE_FEMME : Genre = { code: 'FEMME', libelle: 'Femme'};

export const GENRES : Genre[] = [ GENRE_HOMME, GENRE_FEMME ];

