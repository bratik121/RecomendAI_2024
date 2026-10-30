import { IMovie } from "./movie.interfaces";

export interface IWatchlistItem {
	id: number;
	movie: IMovie;
	watched: boolean;
	watched_at: string | null;
	created_at: string;
}

export interface IWatchlistSummary {
	pending: number;
	watched: number;
	total: number;
}
