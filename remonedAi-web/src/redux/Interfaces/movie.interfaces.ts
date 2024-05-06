export interface IMovie {
	id: number;
	title: string;
	poster_path: string;
	release_year: string;
	overview: string;
	genres: string[];
}

export interface IReview {
	movie_id: number;
	liked: boolean;
}

export interface IRate_10_Movies {
	id_user: number;
	rated_movies: IReview[];
}

export interface IPost_10_Movies {
	id_user: number;
}

export interface MovieState {
	movies: IMovie[];
	isFetching: boolean;
	error: string;
}
