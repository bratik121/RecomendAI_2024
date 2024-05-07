import { configureStore, Middleware } from "@reduxjs/toolkit";

import { rootReducer } from "./reducers";
import { apiMdl, userMiddleware, movieMiddleware } from "./middlewares/";

const middlewares: Middleware[] = [
	apiMdl,
	...userMiddleware,
	...movieMiddleware,
];

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(middlewares),
});
