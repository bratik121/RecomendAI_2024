import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../reducers";
import {
	addToWatchlist,
	fetchWatchlist,
	fetchWatchlistSummary,
	removeFromWatchlist,
	updateWatchlistItem,
} from "../slices/watchlistSlice";

export const useWatchlist = () => {
	const dispatch = useDispatch();
	const { items, summary, loading, error } = useSelector(
		(state: RootState) => state.watchlist
	);

	const refresh = () => {
		dispatch(fetchWatchlist() as any);
		dispatch(fetchWatchlistSummary() as any);
	};

	const add = (movieId: number) => dispatch(addToWatchlist(movieId) as any);
	const remove = (id: number) => dispatch(removeFromWatchlist(id) as any);
	const markWatched = (id: number, watched: boolean) =>
		dispatch(updateWatchlistItem({ id, watched }) as any);

	const isInWatchlist = (movieId: number) =>
		items.some((item) => item.movie.id === movieId);

	const itemByMovieId = (movieId: number) =>
		items.find((item) => item.movie.id === movieId);

	return {
		items,
		summary,
		loading,
		error,
		refresh,
		add,
		remove,
		markWatched,
		isInWatchlist,
		itemByMovieId,
	};
};
