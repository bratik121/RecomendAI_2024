import { API_REQUEST, XHR_REQUEST } from "../constants";
import { createAction } from "@reduxjs/toolkit";

export const apiRequest = createAction(
	API_REQUEST,
	(
		method: string,
		url: string,
		body: any,
		onSuccess: string,
		onError: string,
		token?: string,
		params?: any
	) => ({
		payload: body,
		meta: { method, url, onSuccess, onError, token, params },
	})
);

export const xhrRequest = createAction(
	XHR_REQUEST,
	(
		method: string,
		url: string,
		body: any,
		onSuccess: string,
		onError: string,
		token: string
	) => ({
		payload: body,
		meta: { method, url, onSuccess, onError, token },
	})
);
