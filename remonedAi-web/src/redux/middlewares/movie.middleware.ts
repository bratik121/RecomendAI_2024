import { Middleware } from "redux";

import {
	apiRequest,
	post10MoviesError,
	post10MoviesProcess,
	post10MoviesSuccess,
	postRate10MoviesProcess,
	postRate10MoviesSuccess,
	postRate10MoviesError,
} from "../actions";

import {
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_SUCCESS,
	POST_RATE_10_MOVIES_ERROR,
	POST_RATE_10_MOVIES_SUCCESS,
} from "../constants";

const MOVIE_URL = `${import.meta.env.VITE_API_URL}/Movie/`;

const movieProcess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (post10MoviesProcess.match(action)) {
			dispatch(
				apiRequest(
					"POST",
					`${MOVIE_URL}`,
					action.payload,
					POST_10_MOVIES_SUCCESS,
					POST_10_MOVIES_ERROR
				)
			);
		}
		if (postRate10MoviesProcess.match(action)) {
			dispatch(
				apiRequest(
					"POST",
					`${MOVIE_URL}/rate`,
					action.payload,
					POST_RATE_10_MOVIES_SUCCESS,
					POST_RATE_10_MOVIES_ERROR
				)
			);
		}
	};

const movieSuccess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (post10MoviesSuccess.match(action)) {
			console.log(action.payload);
		}
		if (postRate10MoviesSuccess.match(action)) {
			console.log(action.payload);
		}
	};

const movieError: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (post10MoviesError.match(action)) {
			console.log(action.payload);
		}
		if (postRate10MoviesError.match(action)) {
			console.log(action.payload);
		}
	};

export { movieProcess, movieSuccess, movieError };
