import { useSelector } from "react-redux";
import { selectUser } from "../selectors";
import { useState } from "react";
import { IRate_Movies, IReview } from "../Interfaces";
import axios, { AxiosError } from "axios";

const RATE_MOVIES_URL = `${import.meta.env.VITE_API_URL}/rateMovies`;

export const useRateMovie = (): IUseRateMovie => {
	const { id } = useSelector(selectUser);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const rateMovie = async <P = unknown>(
		review: IReview,
		onSucces?: (params?: P) => void
	) => {
		if (!id) {
			setError("Tienes que iniciar sesion para dar like");
			return;
		}

		setError("");
		setLoading(true);
		try {
			const body: IRate_Movies = {
				id_user: Number(id),
				reviews: [review],
			};

			await axios.post(RATE_MOVIES_URL, body);
			onSucces?.();
		} catch (error) {
			console.log("Error", error);
			const axiosError = error as AxiosError<{ message?: string }>;
			if (
				axiosError.response &&
				axiosError.response.data &&
				axiosError.response.data.message
			) {
				setError(axiosError.response.data.message);
			} else {
				setError("Ocurrio un error inesperado");
			}
		} finally {
			setLoading(false);
		}
	};
	return {
		loading,
		error,
		rateMovie,
	};
};

export interface IUseRateMovie {
	loading: boolean;
	error: string;
	rateMovie: <P = unknown>(
		review: IReview,
		onSucces?: (params?: P) => void
	) => Promise<void>;
}
