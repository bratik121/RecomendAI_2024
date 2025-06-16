import { createAction } from "@reduxjs/toolkit";
import {
	POST_RATE_10_MOVIES_ERROR,
	POST_RATE_10_MOVIES_SUCCESS,
	POST_RATE_1O_MOVIES_PROCESS,
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_PROCESS,
	POST_10_MOVIES_SUCCESS,
	GET_1O_MOVIES_RECOMENDATIONS_PROCESS,
	GET_10_MOVIES_RECOMENDATIONS_SUCCESS,
	GET_10_MOVIES_RECOMENDATIONS_ERROR,
	SEARCH_MOVIES_BY_NAME_PROCESS,
	SEARCH_MOVIES_BY_NAME_SUCCESS,
	SEARCH_MOVIES_BY_NAME_ERROR,
} from "../constants";

import { IMovie, IRate_Movies } from "../Interfaces";

export const postRate10MoviesProcess = createAction<IRate_Movies>(
	POST_RATE_1O_MOVIES_PROCESS
);

export const postRate10MoviesSuccess = createAction<any>(
	POST_RATE_10_MOVIES_SUCCESS
);

export const postRate10MoviesError = createAction<any>(
	POST_RATE_10_MOVIES_ERROR
);

export const post10MoviesProcess = createAction<number>(POST_10_MOVIES_PROCESS);

export const post10MoviesSuccess = createAction<any>(POST_10_MOVIES_SUCCESS);

export const post10MoviesError = createAction<any>(POST_10_MOVIES_ERROR);

// obtener recomendaciones
export const get10MovieRecomendationsProcess = createAction<number>(
	GET_1O_MOVIES_RECOMENDATIONS_PROCESS
);
export const get10MovieRecomendationsSuccess = createAction<IMovie[]>(
	GET_10_MOVIES_RECOMENDATIONS_SUCCESS
);
export const get10MovieRecomendationsError = createAction<any>(
	GET_10_MOVIES_RECOMENDATIONS_ERROR
);

// buscar peliculas por nombre
export const searchMoviesByNameProcess = createAction<{
	title: string;
	id_user?: number;
}>(SEARCH_MOVIES_BY_NAME_PROCESS);

export const searchMoviesByNameSuccess = createAction<any>(
	SEARCH_MOVIES_BY_NAME_SUCCESS
);
export const searchMoviesByNameError = createAction<IMovie[]>(
	SEARCH_MOVIES_BY_NAME_ERROR
);
