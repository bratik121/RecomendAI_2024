import { useState } from "react";
import { IMovie } from "../Interfaces";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../selectors";

export interface IPagination {
	limit: number;
	offset: number;
}

interface IData {
	title: string;
	pagination: Partial<IPagination>;
}

interface IRequest extends IData {
	id_user?: number;
}
interface IResponse {
	movies: IMovie[];
	pages: number;
}

const URL = `${import.meta.env.VITE_API_URL}/searchMoviesByName`;

export const useFetchMoviesByTitle = (): IUseFetchMoviesByTitle => {
	const { id } = useSelector(selectUser);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [movies, setMovies] = useState<IMovie[]>([]);
	const [pages, setPages] = useState<number>(1);

	const fetchMoviesByTitle = async (data: IData) => {
		setLoading(true);
		try {
			const config: AxiosRequestConfig<{
				params: IRequest;
			}> = {
				params: {
					...data,
					...data.pagination,
					id_user: id ? Number(id) : undefined,
				},
			};
			console.log("config");

			const response = await axios.get<IResponse>(URL, config);
			console.log("response", response);
			setMovies(response.data.movies);
			setPages(response.data.pages);
		} catch (error) {
			setError("");
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		movies,
		pages,
		fetchMoviesByTitle,
	};
};

export interface IUseFetchMoviesByTitle {
	loading: boolean;
	error: string;
	movies: IMovie[];
	pages: number | undefined;
	fetchMoviesByTitle: (data: IData) => void;
}
