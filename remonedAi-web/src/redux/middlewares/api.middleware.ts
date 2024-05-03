import { Middleware, MiddlewareAPI } from "redux";
import axios, { AxiosRequestConfig } from "axios";
import { apiRequest, xhrRequest } from "../actions";

export const apiMdl: Middleware =
	({ dispatch }: MiddlewareAPI) =>
	(next) =>
	(action) => {
		if (apiRequest.match(action)) {
			const { method, url, onSuccess, onError, token, params } = action.meta;
			const config: AxiosRequestConfig = {
				url,
				method,
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: token || "",
				},
				params: params,
				data: action.payload && JSON.stringify(action.payload),
			};
			axios(config)
				.then((res) => {
					dispatch({ type: onSuccess, payload: res.data });
				})
				.catch((err) => {
					console.log(err);
					dispatch({ type: onError, payload: err });
				});
		}

		if (xhrRequest.match(action)) {
			const { method, url, onSuccess, onError, token } = action.meta;

			const data = new FormData();
			data.append("file", action.payload.file);

			const xhr = new XMLHttpRequest();

			xhr.onloadend = function () {
				if (xhr.status === 200) {
					const response = xhr.responseText;
					dispatch({
						type: onSuccess,
						payload: response,
					});
				} else {
					dispatch({ type: onError, payload: this.status });
				}
			};

			xhr.open(method, url);

			xhr.setRequestHeader("Accept", "application/json, text/plain, */*");
			xhr.setRequestHeader("Authorization", token || "");

			xhr.send(data);
		}

		return next(action);
	};
