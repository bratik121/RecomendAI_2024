import { MovieState, reduxAction, IMovie } from "../Interfaces";
import {
	POST_10_MOVIES_PROCESS,
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_SUCCESS,
	POST_RATE_1O_MOVIES_PROCESS,
	POST_RATE_10_MOVIES_ERROR,
	GET_10_MOVIES_RECOMENDATIONS_SUCCESS,
	GET_10_MOVIES_RECOMENDATIONS_ERROR,
	SEARCH_MOVIES_BY_NAME_PROCESS,
	SEARCH_MOVIES_BY_NAME_SUCCESS,
	SEARCH_MOVIES_BY_NAME_ERROR,
} from "../constants";

const initialState: MovieState = {
	isFetching: true,
	movies: [],
	error: "",
};

export const movie = (
	state: MovieState = initialState,
	action: reduxAction
): MovieState => {
	switch (action.type) {
		case POST_10_MOVIES_PROCESS:
			return {
				...state,
				isFetching: true,
				error: "",
			};
		case POST_10_MOVIES_SUCCESS:
			return {
				...state,
				isFetching: false,
				movies: action.payload,
			};
		case POST_10_MOVIES_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		case POST_RATE_1O_MOVIES_PROCESS:
			return {
				...state,
				isFetching: true,
				error: "",
			};
		case POST_RATE_10_MOVIES_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		case GET_10_MOVIES_RECOMENDATIONS_SUCCESS:
			return {
				...state,
				movies: action.payload,
				isFetching: false,
			};
		case GET_10_MOVIES_RECOMENDATIONS_ERROR:
			return {
				...state,
				isFetching: false,
			};
		case SEARCH_MOVIES_BY_NAME_PROCESS:
			return {
				...state,
				isFetching: true,
				error: "",
			};
		case SEARCH_MOVIES_BY_NAME_SUCCESS:
			return {
				...state,
				isFetching: false,
				movies: action.payload,
			};
		case SEARCH_MOVIES_BY_NAME_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		default:
			return state;
	}
};
