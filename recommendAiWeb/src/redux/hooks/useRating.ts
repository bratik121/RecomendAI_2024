import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/api/client";

interface IRatingSummary {
	average: number | null;
	count: number;
	distribution: Record<string, number>;
	user_rating: { id: number; score: number } | null;
}

export const useRating = (movieId?: string) => {
	const [summary, setSummary] = useState<IRatingSummary | null>(null);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const fetchSummary = useCallback(async () => {
		if (!movieId) return;
		setLoading(true);
		setError("");
		try {
			const response = await api.get<IRatingSummary>(`/movies/${movieId}/ratings/`);
			setSummary(response.data);
		} catch {
			setError("No se pudo cargar la calificación.");
		} finally {
			setLoading(false);
		}
	}, [movieId]);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	const submit = async (score: number) => {
		if (!movieId) return;
		setSubmitting(true);
		setError("");
		try {
			if (summary?.user_rating) {
				await api.patch(`/ratings/${summary.user_rating.id}/`, { score });
			} else {
				await api.post("/ratings/", { movie: Number(movieId), score });
			}
			await fetchSummary();
		} catch (requestError: any) {
			setError(
				requestError?.response?.data?.detail ||
					requestError?.response?.data?.score?.[0] ||
					"Ocurrió un error inesperado."
			);
		} finally {
			setSubmitting(false);
		}
	};

	return { summary, loading, submitting, error, submit };
};
