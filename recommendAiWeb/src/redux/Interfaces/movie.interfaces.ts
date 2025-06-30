export interface IMovie {
	id: number;
	title: string;
	poster_path: string;
	release_year: string;
	vote_average: number;
	overview: string;
	genres: string[];
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
