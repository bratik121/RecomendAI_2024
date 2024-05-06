import { createAction } from "@reduxjs/toolkit";
import {
	POST_REGISTER_USER_PROCESS,
	POST_LOGIN_USER_PROCESS,
	POST_LOGIN_USER_ERROR,
	POST_LOGIN_USER_SUCCESS,
	POST_REGISTER_USER_ERROR,
	POST_REGISTER_USER_SUCCESS,
	USER_LOGOUT,
} from "../constants";
import { IRegisterUser, ILoginUser, IApiResponse } from "../Interfaces";

//Register
export const postRegisterUserProcess = createAction<IRegisterUser>(
	POST_REGISTER_USER_PROCESS
);

export const postRegisterUserSuccess = createAction<any>(
	POST_REGISTER_USER_SUCCESS
);

export const postRegisterUserError = createAction<any>(
	POST_REGISTER_USER_ERROR
);

//Login
export const postLoginUserProcess = createAction<ILoginUser>(
	POST_LOGIN_USER_PROCESS
);

export const postLoginUserSuccess = createAction<any>(POST_LOGIN_USER_SUCCESS);

export const postLoginUserError = createAction<any>(POST_LOGIN_USER_ERROR);

export const setUserFromStorage = createAction<any>("SET_USER_FROM_STORAGE");

export const userLogout = createAction(USER_LOGOUT);
