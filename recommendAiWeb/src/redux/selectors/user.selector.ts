import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../reducers";

export const selectUser = createSelector(
	(state: RootState) => state.user,
	(user) => user.user
);
