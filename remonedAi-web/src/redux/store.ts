import { configureStore, Middleware } from "@reduxjs/toolkit";

import { rootReducer } from "./reducers";
import { apiMdl, userMiddleware } from "./middlewares/";

const middlewares: Middleware[] = [apiMdl, ...userMiddleware];

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(middlewares),
});
