import { Middleware } from "redux";
import {
	apiRequest,
	postLoginUserProcess,
	postRegisterUserProcess,
	postLoginUserError,
	postLoginUserSuccess,
	postRegisterUserError,
	postRegisterUserSuccess,
	userLogout,
} from "../actions";
import {
	POST_REGISTER_USER_ERROR,
	POST_REGISTER_USER_SUCCESS,
	POST_LOGIN_USER_ERROR,
	POST_LOGIN_USER_SUCCESS,
} from "../constants";

import { storage } from "@/src/helpers";

const USER_URL = `${import.meta.env.VITE_API_URL}/User/`;

const LOGIN_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

const userProcess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (postRegisterUserProcess.match(action)) {
			dispatch(
				apiRequest(
					"POST",
					`${USER_URL}`,
					action.payload,
					POST_REGISTER_USER_SUCCESS,
					POST_REGISTER_USER_ERROR
				)
			);
		}
		if (postLoginUserProcess.match(action)) {
			dispatch(
				apiRequest(
					"POST",
					LOGIN_URL,
					action.payload,
					POST_LOGIN_USER_SUCCESS,
					POST_LOGIN_USER_ERROR
				)
			);
		}
	};

const userSuccess: Middleware = () => (next) => (action) => {
	next(action);
	if (postRegisterUserSuccess.match(action)) {
		const user = {
			email: action.payload.email,
			name: action.payload.name,
			lastname: action.payload.lastname,
			id: action.payload.id,
		};

		storage.set("user", user);
	}
	if (postLoginUserSuccess.match(action)) {
		const user = {
			email: action.payload.email,
			name: action.payload.name,
			lastname: action.payload.lastname,
			id: action.payload.id,
		};
		storage.set("user", user);
	}
};

const userErrors: Middleware = () => (next) => (action) => {
	next(action);
	if (postRegisterUserError.match(action)) {
		console.log(action.payload);
	}
	if (postLoginUserError.match(action)) {
		console.log(action.payload);
	}
};

const userStorageProccess: Middleware = () => (next) => (action) => {
	next(action);
	if (userLogout.match(action)) {
		storage.remove("user");
	}
};

export const userMiddleware = [
	userProcess,
	userSuccess,
	userErrors,
	userStorageProccess,
];
