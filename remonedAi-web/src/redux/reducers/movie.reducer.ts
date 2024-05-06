import { MovieState, reduxAction, IMovie } from "../Interfaces";
import {
	POST_10_MOVIES_PROCESS,
	POST_10_MOVIES_ERROR,
	POST_10_MOVIES_SUCCESS,
	POST_RATE_1O_MOVIES_PROCESS,
	POST_RATE_10_MOVIES_ERROR,
	POST_RATE_10_MOVIES_SUCCESS,
} from "../constants";

const movies: IMovie[] = [
	{
		id: 615656,
		title: "Meg 2: The Trench",
		poster_path: "/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
		release_year: "2023",
		overview:
			"An exploratory dive into the deepest depths of the Pacific Ocean, led by a Chinese oceanographer, is disrupted by a Megalodon.",
		genres: ["Action", "Science Fiction", "Horror"],
	},
	{
		id: 758323,
		title: "The Pope's Exorcist",
		poster_path: "/9JBEPLTPSm0d1mbEcLxULjJq9Eh.jpg",
		release_year: "2023",
		overview:
			"Father Gabriele Amorth Chief Exorcist of the Vatican City, performs his ninth exorcism on an Italian",
		genres: ["Horror", "Mystery", "Thriller"],
	},
	{
		id: 667538,
		title: "Transformers: Rise of the Beasts",
		poster_path: "/gPbM0MK8CP8A174rmUwGsADNYKD.jpg",
		release_year: "2023",
		overview:
			"When a new threat capable of destroying the entire world emerges, the Autobots and Decepticons must work together to stop it.",
		genres: ["Action", "Adventure", "Science Fiction"],
	},
	{
		id: 693134,
		title: "Dune: Part Two",
		poster_path: "/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
		release_year: "2024",
		overview:
			"Follow the mythic journey of Paul Atreides as he seeks to avenge the traitorous plot against his noble family.",
		genres: ["Science Fiction", "Adventure"],
	},
];

const initialState: MovieState = {
	isFetching: false,
	movies: movies,
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
		case POST_RATE_10_MOVIES_SUCCESS:
			return {
				...state,
				isFetching: false,
				movies: action.payload,
			};
		case POST_RATE_10_MOVIES_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		default:
			return state;
	}
};
