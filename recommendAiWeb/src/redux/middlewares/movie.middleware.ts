import { Middleware } from "redux";

import {
	apiRequest,
	post10MoviesError,
	post10MoviesProcess,
	post10MoviesSuccess,
	postRate10MoviesProcess,
	postRate10MoviesSuccess,
	postRate10MoviesError,
	get10MovieRecomendationsProcess,
	get10MovieRecomendationsSuccess,
	get10MovieRecomendationsError,
	searchMoviesByNameSuccess,
	searchMoviesByNameError,
	searchMoviesByNameProcess,
} from "../actions";

import {
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_SUCCESS,
	POST_RATE_10_MOVIES_ERROR,
	POST_RATE_10_MOVIES_SUCCESS,
	GET_10_MOVIES_RECOMENDATIONS_SUCCESS,
	GET_10_MOVIES_RECOMENDATIONS_ERROR,
} from "../constants";

const RATE_MOVIES_URL = `${import.meta.env.VITE_API_URL}/rateMovies`;

const GET_10_MOVIES_URL = `${import.meta.env.VITE_API_URL}/tenmovies/`;

const RECOMMEND_MOVIES_URL = `${import.meta.env.VITE_API_URL}/recommend/`;

const SEARCH_MOVIES_BY_NAME_URL = `${
	import.meta.env.VITE_API_URL
}/searchMoviesByName/`;

const movieProcess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (post10MoviesProcess.match(action)) {
			console.log("url: ", `${GET_10_MOVIES_URL + action.payload}`);
			dispatch(
				apiRequest(
					"GET",
					`${GET_10_MOVIES_URL + action.payload}`,
					null,
					POST_10_MOVIES_SUCCESS,
					POST_10_MOVIES_ERROR
				)
			);
		}
		if (postRate10MoviesProcess.match(action)) {
			dispatch(
				apiRequest(
					"POST",
					`${RATE_MOVIES_URL}`,
					action.payload,
					POST_RATE_10_MOVIES_SUCCESS,
					POST_RATE_10_MOVIES_ERROR
				)
			);
		}
		if (get10MovieRecomendationsProcess.match(action)) {
			dispatch(
				apiRequest(
					"GET",
					`${RECOMMEND_MOVIES_URL + action.payload}`,
					null,
					GET_10_MOVIES_RECOMENDATIONS_SUCCESS,
					GET_10_MOVIES_RECOMENDATIONS_ERROR
				)
			);
		}

		if (searchMoviesByNameProcess.match(action)) {
			dispatch(
				apiRequest(
					"GET",
					`${SEARCH_MOVIES_BY_NAME_URL}`,
					action.payload,
					searchMoviesByNameSuccess.type,
					searchMoviesByNameError.type,
					"",
					action.payload
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
			console.log("Peliculas clasificadas con exito!");
			console.log(action.payload);
			console.log(action.payload.id_user);
			dispatch(get10MovieRecomendationsProcess(action.payload.id_user));
		}
		if (get10MovieRecomendationsSuccess.match(action)) {
			console.log("Peliculas obtenidas con exito");
		}
		if (searchMoviesByNameSuccess.match(action)) {
			console.log("Peliculas encontradas con exito");
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
		if (get10MovieRecomendationsError.match(action)) {
			console.log(action.payload);
		}

		if (searchMoviesByNameError.match(action)) {
			console.log("Error al buscar peliculas por nombre");
			console.log(action.payload);
		}
	};

export const movieMiddleware = [movieProcess, movieSuccess, movieError];
