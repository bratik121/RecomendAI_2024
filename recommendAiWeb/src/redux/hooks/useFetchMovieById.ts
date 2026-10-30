import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { api } from "@/src/api/client";
import { IMovieDetail } from "../Interfaces";

export const useFetchMovieById = (id?: string) => {
	const [movie, setMovie] = useState<IMovieDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		if (!id || Number.isNaN(Number(id))) {
			setLoading(false);
			setNotFound(true);
			return;
		}

		const controller = new AbortController();
		setLoading(true);
		setError("");
		setNotFound(false);

		api
			.get<IMovieDetail>(`/movies/${id}/`, { signal: controller.signal })
			.then((response) => setMovie(response.data))
			.catch((requestError: AxiosError) => {
				if (requestError.code === "ERR_CANCELED") return;
				if (requestError.response?.status === 404) {
					setNotFound(true);
				} else {
					setError("No pudimos cargar la película. Intentá de nuevo.");
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});

		return () => controller.abort();
	}, [id]);

	return { movie, loading, error, notFound };
};
