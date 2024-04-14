import { combineReducers } from "@reduxjs/toolkit";

import { user } from "./user.reducer";
import { userState } from "../Interfaces";

export interface RootState {
	user: userState;
}

export const rootReducer = combineReducers({
	user,
});
