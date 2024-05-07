import { combineReducers } from "@reduxjs/toolkit";

import { user } from "./user.reducer";
import { movie } from "./movie.reducer";
import { userState, MovieState } from "../Interfaces";

export interface RootState {
	user: userState;
	movie: MovieState;
}

export const rootReducer = combineReducers({
	user,
	movie,
});
