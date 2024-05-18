export interface IMovie {
	id: number;
	title: string;
	poster_path: string;
	release_year: string;
	vote_average: number;
	overview: string;
	genres: string[];
}

export interface IReview {
	id_movie: number;
	like: boolean;
}

export interface IRate_10_Movies {
	id_user: number;
	movies: IReview[];
}

export interface IPost_10_Movies {
	id_user: number;
}

export interface MovieState {
	movies: IMovie[];
	isFetching: boolean;
	error: string;
}
