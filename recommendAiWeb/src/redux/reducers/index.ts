import { combineReducers } from "@reduxjs/toolkit";

import { user } from "./user.reducer";
import { movie } from "./movie.reducer";
import { watchlistReducer } from "../slices/watchlistSlice";
import { userState, MovieState, IWatchlistSummary, IWatchlistItem } from "../Interfaces";

export interface RootState {
	user: userState;
	movie: MovieState;
	watchlist: {
		items: IWatchlistItem[];
		summary: IWatchlistSummary;
		loading: boolean;
		error: string;
	};
}

export const rootReducer = combineReducers({
	user,
	movie,
	watchlist: watchlistReducer,
});
