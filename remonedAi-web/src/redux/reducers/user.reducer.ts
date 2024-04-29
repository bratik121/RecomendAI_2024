import { Iuser, userState, userAction } from "../Interfaces";
import {
	POST_LOGIN_USER_ERROR,
	POST_LOGIN_USER_PROCESS,
	POST_LOGIN_USER_SUCCESS,
	POST_REGISTER_USER_ERROR,
	POST_REGISTER_USER_PROCESS,
	POST_REGISTER_USER_SUCCESS,
	USER_LOGOUT,
} from "../constants";

const initalState: userState = {
	isFetching: false,
	isAuthenticated: true,
	user: {
		email: "",
		name: "Bryant",
		lastname: "Mitchell",
		id: "",
	},
	error: "",
};

export const user = (
	state: userState = initalState,
	action: userAction
): userState => {
	switch (action.type) {
		case POST_REGISTER_USER_PROCESS:
			return {
				...state,
				isFetching: true,
				error: "",
			};
		case POST_REGISTER_USER_SUCCESS:
			return {
				...state,
				isFetching: false,
				isAuthenticated: true,
				user: action.payload,
			};
		case POST_REGISTER_USER_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		case POST_LOGIN_USER_PROCESS:
			return {
				...state,
				isFetching: true,
				error: "",
			};
		case POST_LOGIN_USER_SUCCESS:
			return {
				...state,
				isFetching: false,
				isAuthenticated: true,
				user: action.payload,
			};
		case POST_LOGIN_USER_ERROR:
			return {
				...state,
				isFetching: false,
				error: action.payload,
			};
		case USER_LOGOUT:
			return initalState;
		default:
			return state;
	}
};
