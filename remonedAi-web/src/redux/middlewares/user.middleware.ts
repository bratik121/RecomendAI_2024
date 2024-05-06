import { Middleware } from "redux";
import {
	apiRequest,
	postLoginUserProcess,
	postRegisterUserProcess,
	postLoginUserError,
	postLoginUserSuccess,
	postRegisterUserError,
	postRegisterUserSuccess,
} from "../actions";
import {
	POST_REGISTER_USER_ERROR,
	POST_REGISTER_USER_SUCCESS,
	POST_LOGIN_USER_ERROR,
	POST_LOGIN_USER_SUCCESS,
} from "../constants";

import { storage } from "@/src/helpers";

const USER_URL = `${import.meta.env.VITE_API_URL}/User/`;

const userProcess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (postRegisterUserProcess.match(action)) {
			console.log("Url", USER_URL); // "http://localhost:3000/api/User
			console.log("action.payload : ", action.payload);
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
					`${USER_URL}/login`,
					action.payload,
					POST_LOGIN_USER_SUCCESS,
					POST_LOGIN_USER_ERROR
				)
			);
		}
	};

const userSuccess: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (postRegisterUserSuccess.match(action)) {
			console.log(action.payload);
			const user = {
				email: action.payload.email,
				name: action.payload.name,
				lastname: action.payload.lastname,
				id: action.payload.id,
			};
			console.log("user", user);
			storage.set("user", user);
		}
		if (postLoginUserSuccess.match(action)) {
			console.log(action.payload);
			storage.set("user", action.payload);
		}
	};

const userErrors: Middleware =
	({ dispatch }) =>
	(next) =>
	(action) => {
		next(action);
		if (postRegisterUserError.match(action)) {
			console.log(action.payload);
		}
		if (postLoginUserError.match(action)) {
			console.log(action.payload);
		}
	};

export const userMiddleware = [userProcess, userSuccess, userErrors];
