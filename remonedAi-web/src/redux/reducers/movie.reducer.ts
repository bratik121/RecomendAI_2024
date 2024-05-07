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
			"Father Gabriele Amorth, Chief Exorcist of the Vatican City, performs his ninth exorcism on an Italian woman tormented by evil.",
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
			"Follow the mythic journey of Paul Atreides as he seeks to avenge the traitorous plot against his noble family and the desert planet Arrakis.",
		genres: ["Science Fiction", "Adventure"],
	},
	{
		id: 640146,
		title: "Ant-Man and the Wasp: Quantumania",
		poster_path: "/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg",
		release_year: "2023",
		overview:
			"Super-Hero partners Scott Lang and Hope van Dyne, along with Hope’s parents Hank Pym and Janet Van Dyne and Lang’s daughter Cassie, embark on an adventure that stretches the boundaries of reality as they know it.",
		genres: ["Action", "Adventure", "Science Fiction"],
	},
	{
		id: 677179,
		title: "Creed III",
		poster_path: "/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg",
		release_year: "2023",
		overview:
			"After dominating the boxing world, Adonis Creed's life has become a balancing act between personal obligations and training for his next big fight.",
		genres: ["Drama", "Action"],
	},
	{
		id: 385687,
		title: "Fast X",
		poster_path: "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
		release_year: "2023",
		overview:
			"Over many missions and against impossible odds, Dominic Toretto and his family face their greatest challenge yet; an international terrorist only known as Dante.",
		genres: ["Action", "Crime", "Thriller"],
	},
	{
		id: 614479,
		title: "Insidious: The Red Door",
		poster_path: "/azTC5osYiqei1ofw6Z3GmUrxQbi.jpg",
		release_year: "2023",
		overview:
			"To put their demons to rest once and for all, Josh and Renai Lambert, joined by their children, confront the supernatural entities that have sought to take them to the other side.",
		genres: ["Horror", "Mystery", "Thriller"],
	},
	{
		id: 823464,
		title: "Godzilla x Kong: The New Empire",
		poster_path: "/gmGK5Gw5CIGMPhOmTO0bNA9Q66c.jpg",
		release_year: "2024",
		overview:
			"Following their explosive showdown, Godzilla and Kong are thrust into an uncharted land where they are not the biggest predators.",
		genres: ["Action", "Science Fiction", "Adventure"],
	},
	{
		id: 646389,
		title: "Plane",
		poster_path: "/qi9r5xBgcc9KTxlOLjssEbDgO0J.jpg",
		release_year: "2023",
		overview:
			"After a heroic job of successfully landing his storm-damaged aircraft in a war zone, a pilot must keep his passengers alive and confront the militants who are hunting them.",
		genres: ["Action", "Adventure", "Thriller"],
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
