export interface IMovie {
	id: number;
	title: string;
	poster_path: string;
	release_year: string;
	vote_average: number;
	overview: string;
	genres: string[];
	liked?: boolean;
	average_rating?: number | null;
	ratings_count?: number;
}

export interface IMovieDetail extends IMovie {
	popularity: number;
	revenue: number;
	average_rating?: number | null;
	ratings_count?: number;
	user_rating?: { id: number; score: number } | null;
	liked?: boolean;
}

export interface IReview {
	id_movie: number;
	like: boolean;
}

export interface IRate_Movies {
	id_user: number;
	reviews: IReview[];
}

export interface IRateMovie {
	id_user: number;
	review: IReview;
}

export interface IPost_10_Movies {
	id_user: number;
}

export interface MovieState {
	movies: IMovie[];
	isFetching: boolean;
	error: string;
}
