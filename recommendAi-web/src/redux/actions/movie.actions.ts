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
} from "../constants";

import { IRate_10_Movies } from "../Interfaces";

export const postRate10MoviesProcess = createAction<IRate_10_Movies>(
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
export const get10MovieRecomendationsSuccess = createAction<any>(
	GET_10_MOVIES_RECOMENDATIONS_SUCCESS
);
export const get10MovieRecomendationsError = createAction<any>(
	GET_10_MOVIES_RECOMENDATIONS_ERROR
);
