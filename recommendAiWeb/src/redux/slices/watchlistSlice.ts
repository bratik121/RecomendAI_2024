import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/src/api/client";
import { IWatchlistItem, IWatchlistSummary } from "../Interfaces";

interface WatchlistState {
	items: IWatchlistItem[];
	summary: IWatchlistSummary;
	loading: boolean;
	error: string;
}

const initialState: WatchlistState = {
	items: [],
	summary: { pending: 0, watched: 0, total: 0 },
	loading: false,
	error: "",
};

export const fetchWatchlist = createAsyncThunk(
	"watchlist/fetch",
	async (params?: { watched?: boolean }) => {
		const response = await api.get<IWatchlistItem[]>("/watchlist/", { params });
		return response.data;
	}
);

export const fetchWatchlistSummary = createAsyncThunk(
	"watchlist/summary",
	async () => {
		const response = await api.get<IWatchlistSummary>("/watchlist/summary/");
		return response.data;
	}
);

export const addToWatchlist = createAsyncThunk(
	"watchlist/add",
	async (movieId: number) => {
		const response = await api.post<IWatchlistItem>("/watchlist/", {
			movie_id: movieId,
		});
		return response.data;
	}
);

export const removeFromWatchlist = createAsyncThunk(
	"watchlist/remove",
	async (id: number) => {
		await api.delete(`/watchlist/${id}/`);
		return id;
	}
);

export const updateWatchlistItem = createAsyncThunk(
	"watchlist/update",
	async ({ id, watched }: { id: number; watched: boolean }) => {
		const response = await api.patch<IWatchlistItem>(`/watchlist/${id}/`, {
			watched,
		});
		return response.data;
	}
);

const decrementPending = (state: WatchlistState) => {
	state.summary.pending = Math.max(0, state.summary.pending - 1);
	state.summary.total = Math.max(0, state.summary.total - 1);
};

const watchlistSlice = createSlice({
	name: "watchlist",
	initialState,
	reducers: {
		resetWatchlist: () => initialState,
		applyPendingRemoval: (state) => {
			decrementPending(state);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWatchlist.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(fetchWatchlist.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchWatchlist.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "";
			})
			.addCase(fetchWatchlistSummary.fulfilled, (state, action) => {
				state.summary = action.payload;
			})
			.addCase(addToWatchlist.fulfilled, (state, action) => {
				state.items.unshift(action.payload);
				state.summary.pending += 1;
				state.summary.total += 1;
			})
			.addCase(removeFromWatchlist.fulfilled, (state, action) => {
				const index = state.items.findIndex((item) => item.id === action.payload);
				if (index >= 0) {
					const [removed] = state.items.splice(index, 1);
					if (removed && !removed.watched) {
						decrementPending(state);
					} else {
						state.summary.total = Math.max(0, state.summary.total - 1);
					}
				}
			})
			.addCase(updateWatchlistItem.fulfilled, (state, action) => {
				const updated = action.payload;
				const index = state.items.findIndex((item) => item.id === updated.id);
				if (index >= 0) {
					const previous = state.items[index];
					state.items[index] = updated;
					if (previous.watched !== updated.watched) {
						if (updated.watched) {
							state.summary.pending = Math.max(0, state.summary.pending - 1);
							state.summary.watched += 1;
						} else {
							state.summary.pending += 1;
							state.summary.watched = Math.max(0, state.summary.watched - 1);
						}
					}
				}
			});
	},
});

export const { resetWatchlist, applyPendingRemoval } = watchlistSlice.actions;

export const watchlistReducer = watchlistSlice.reducer;
