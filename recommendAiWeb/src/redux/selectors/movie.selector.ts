import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../reducers";

export const selectMovies = createSelector(
	(state: RootState) => state.movie,
	(movie) => movie.movies
);

export const selectMovie = createSelector(
	(state: RootState) => state.movie,
	(movie) => movie
);
