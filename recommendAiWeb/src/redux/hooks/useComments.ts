import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { IComment, ICommentsResponse } from "../Interfaces";
import { storage } from "@/src/helpers";

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
	const token = storage.get("token");
	return token ? { Authorization: `Token ${token}` } : {};
};

const getErrorMessage = (error: unknown) => {
	const axiosError = error as AxiosError<any>;
	const data = axiosError.response?.data;
	if (typeof data === "string") return data;
	if (data?.detail) return data.detail;
	if (data?.body?.[0]) return data.body[0];
	if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
	return "Ocurrió un error inesperado.";
};

const updateCommentTree = (
	comments: IComment[],
	id: number,
	updater: (comment: IComment) => IComment
): IComment[] =>
	comments.map((comment) => {
		if (comment.id === id) return updater(comment);
		if (comment.replies?.some((reply) => reply.id === id)) {
			return {
				...comment,
				replies: comment.replies.map((reply) =>
					reply.id === id ? updater(reply) : reply
				),
			};
		}
		return comment;
	});

export const useComments = (movieId?: string) => {
	const [comments, setComments] = useState<IComment[]>([]);
	const [count, setCount] = useState(0);
	const [page, setPage] = useState(1);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [unauthorized, setUnauthorized] = useState(false);

	const listUrl = `${API_URL}/movies/${movieId}/comments/`;

	const fetchPage = useCallback(
		async (nextPage: number) => {
			if (!movieId) return;
			setLoading(true);
			setError("");
			try {
				const response = await axios.get<ICommentsResponse>(listUrl, {
					params: { page: nextPage },
				});
				setComments((previous) => {
					if (nextPage === 1) return response.data.results;
					const known = new Set(previous.map((comment) => comment.id));
					return [
						...previous,
						...response.data.results.filter((comment) => !known.has(comment.id)),
					];
				});
				setCount(response.data.count);
				setHasNext(Boolean(response.data.next));
				setPage(nextPage);
			} catch (requestError) {
				setError(getErrorMessage(requestError));
			} finally {
				setLoading(false);
			}
		},
		[listUrl, movieId]
	);

	useEffect(() => {
		setComments([]);
		setCount(0);
		setPage(1);
		setHasNext(false);
		setUnauthorized(false);
		if (movieId) fetchPage(1);
	}, [movieId, fetchPage]);

	const handleError = (requestError: unknown) => {
		const axiosError = requestError as AxiosError;
		if (axiosError.response?.status === 401) {
			setUnauthorized(true);
			setError("Tu sesión expiró. Volvé a iniciar sesión para comentar.");
		} else if (axiosError.response?.status === 403) {
			setError("No tenés permiso para realizar esta acción.");
		} else if (axiosError.response?.status === 429) {
			setError("Estás comentando demasiado rápido. Esperá un momento.");
		} else {
			setError(getErrorMessage(requestError));
		}
	};

	const createComment = async (body: string, parentId?: number | null) => {
		setSubmitting(true);
		setError("");
		try {
			const response = await axios.post<IComment>(
				listUrl,
				{ body, parent: parentId ?? null },
				{ headers: authHeaders() }
			);
			const created = response.data;
			if (parentId) {
				setComments((previous) =>
					previous.map((comment) =>
						comment.id === parentId
							? {
									...comment,
									replies: [...(comment.replies || []), created],
								}
							: comment
					)
				);
			} else {
				setComments((previous) => [created, ...previous]);
				setCount((previous) => previous + 1);
			}
			return true;
		} catch (requestError) {
			handleError(requestError);
			return false;
		} finally {
			setSubmitting(false);
		}
	};

	const updateComment = async (id: number, body: string) => {
		setSubmitting(true);
		setError("");
		try {
			const response = await axios.patch<IComment>(
				`${API_URL}/comments/${id}/`,
				{ body },
				{ headers: authHeaders() }
			);
			setComments((previous) =>
				updateCommentTree(previous, id, () => response.data)
			);
			return true;
		} catch (requestError) {
			handleError(requestError);
			return false;
		} finally {
			setSubmitting(false);
		}
	};

	const deleteComment = async (id: number) => {
		setSubmitting(true);
		setError("");
		try {
			const target = comments.find(
				(comment) =>
					comment.id === id || comment.replies?.some((reply) => reply.id === id)
			);
			const isRoot = target?.id === id;
			const hasReplies = isRoot && Boolean(target?.replies?.length);

			await axios.delete(`${API_URL}/comments/${id}/`, {
				headers: authHeaders(),
			});

			if (hasReplies) {
				setComments((previous) =>
					updateCommentTree(previous, id, (comment) => ({
						...comment,
						body: "",
						is_deleted: true,
						can_edit: false,
					}))
				);
			} else if (isRoot) {
				setComments((previous) => previous.filter((comment) => comment.id !== id));
				setCount((previous) => Math.max(0, previous - 1));
			} else {
				setComments((previous) =>
					previous.map((comment) => ({
						...comment,
						replies: comment.replies?.filter((reply) => reply.id !== id),
					}))
				);
			}
			return true;
		} catch (requestError) {
			handleError(requestError);
			return false;
		} finally {
			setSubmitting(false);
		}
	};

	return {
		comments,
		count,
		page,
		hasNext,
		loading,
		submitting,
		error,
		unauthorized,
		fetchPage,
		createComment,
		updateComment,
		deleteComment,
	};
};
