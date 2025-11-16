export interface Movie {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  originalTitle?: string;
  year?: number;
  runtime?: number;
  plot?: string;
  tagline?: string;
  language?: string;
  country?: string;
  posterUrl?: string;
  backdropUrl?: string;
  sourceType: 'MANUAL' | 'TMDB' | 'IMDB' | 'OMDB' | 'HYBRID';
  rating?: number;
  contentRating?: string;
  certification?: string;
  externalMatches?: ExternalMatch[];
  movieGenres?: MovieGenre[];
  moviePeople?: MoviePerson[];
  copies?: Copy[];
}

export interface Copy {
  id: string;
  createdAt: string;
  updatedAt: string;
  movieId: string;
  format?: string;
  edition?: string;
  region?: string;
  distributor?: string;
  upc?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  condition?: string;
  notes?: string;
  location?: string;
  hasSlipcover: boolean;
  isSealed: boolean;
}

export interface ExternalMatch {
  id: string;
  createdAt: string;
  movieId: string;
  source: 'TMDB' | 'IMDB';
  externalId: string;
  url?: string;
  rating?: number;
  voteCount?: number;
}

export interface Person {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  biography?: string;
  photoUrl?: string;
  tmdbId?: number;
  imdbId?: string;
}

export interface MoviePerson {
  id: string;
  movieId: string;
  personId: string;
  person: Person;
  role: 'DIRECTOR' | 'ACTOR' | 'WRITER' | 'PRODUCER' | 'CINEMATOGRAPHER' | 'EDITOR' | 'COMPOSER';
  character?: string;
  order?: number;
}

export interface Genre {
  id: string;
  name: string;
  tmdbId?: number;
}

export interface MovieGenre {
  id: string;
  movieId: string;
  genreId: string;
  genre: Genre;
}

export interface MovieFormData {
  title: string;
  originalTitle?: string;
  year?: number;
  runtime?: number;
  plot?: string;
  tagline?: string;
  language?: string;
  country?: string;
  posterUrl?: string;
  backdropUrl?: string;
  sourceType?: string;
  rating?: number;
  contentRating?: string;
  certification?: string;
}

export interface SearchResult {
  tmdb?: TMDBSearchResult[];
  omdb?: OMDBSearchResult[];
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  originalTitle: string;
  year?: number;
  posterUrl?: string;
  overview: string;
  rating?: number;
}

export interface OMDBSearchResult {
  imdbId: string;
  title: string;
  year: number;
  posterUrl?: string;
  type: string;
}
