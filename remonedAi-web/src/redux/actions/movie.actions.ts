import { createAction } from "@reduxjs/toolkit";
import {
	POST_RATE_10_MOVIES_ERROR,
	POST_RATE_10_MOVIES_SUCCESS,
	POST_RATE_1O_MOVIES_PROCESS,
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_PROCESS,
	POST_10_MOVIES_SUCCESS,
} from "../constants";

import { IRate_10_Movies, IApiResponse, IPost_10_Movies } from "../Interfaces";

export const postRate10MoviesProcess = createAction<IRate_10_Movies>(
	POST_RATE_1O_MOVIES_PROCESS
);

export const postRate10MoviesSuccess = createAction<any>(
	POST_RATE_10_MOVIES_SUCCESS
);

export const postRate10MoviesError = createAction<any>(
	POST_RATE_10_MOVIES_ERROR
);

export const post10MoviesProcess = createAction<IPost_10_Movies>(
	POST_10_MOVIES_PROCESS
);

export const post10MoviesSuccess = createAction<any>(POST_10_MOVIES_SUCCESS);

export const post10MoviesError = createAction<any>(POST_10_MOVIES_ERROR);
