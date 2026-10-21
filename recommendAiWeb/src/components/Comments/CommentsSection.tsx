import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { userLogout } from "@/src/redux/actions";
import { useComments } from "@/src/redux/hooks/useComments";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

type Props = {
	movieId?: string;
};

const CommentsSection = ({ movieId }: Props) => {
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector((state: RootState) => state.user);
	const {
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
	} = useComments(movieId);

	useEffect(() => {
		if (unauthorized) dispatch(userLogout());
	}, [unauthorized, dispatch]);

	return (
		<section id="comments" className="mt-16 border-t border-white/10 pt-10">
			<div className="mb-6 flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
						Comunidad
					</p>
					<h2 className="mt-1 font-custom text-3xl font-bold text-white">
						Comentarios{" "}
						<span className="text-lg font-medium text-c_gray-900">({count})</span>
					</h2>
				</div>
			</div>

			{isAuthenticated ? (
				<div className="mb-8">
					<CommentForm
						onSubmit={(body) => createComment(body, null)}
						submitting={submitting}
						placeholder="¿Qué te pareció esta película?"
					/>
				</div>
			) : (
				<div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary-500/20 bg-primary-500/5 p-5">
					<p className="text-sm text-c_gray-300">
						Iniciá sesión para dejar tu opinión y responder a otros usuarios.
					</p>
					<Link
						to="/sign/in"
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-c_black transition-colors hover:bg-primary-400"
					>
						Iniciar sesión
					</Link>
				</div>
			)}

			{error && (
				<div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
					{error}
				</div>
			)}

			{loading && comments.length === 0 ? (
				<div className="space-y-3">
					{[1, 2, 3].map((item) => (
						<div
							key={item}
							className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
						/>
					))}
				</div>
			) : comments.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
					<p className="text-lg font-medium text-c_gray-300">
						Todavía no hay comentarios.
					</p>
					<p className="mt-1 text-sm text-c_gray-900">
						{isAuthenticated
							? "Sé el primero en compartir tu opinión."
							: "Iniciá sesión para abrir la conversación."}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{comments.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							onReply={(commentId, body) => createComment(body, commentId)}
							onEdit={updateComment}
							onDelete={deleteComment}
							submitting={submitting}
						/>
					))}
				</div>
			)}

			{hasNext && (
				<div className="mt-6 flex justify-center">
					<button
						type="button"
						onClick={() => fetchPage(page + 1)}
						disabled={loading}
						className="rounded-lg border border-primary-500/30 px-5 py-2.5 text-sm font-semibold text-primary-300 transition-colors hover:border-primary-400 hover:bg-primary-500/10 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "Cargando..." : "Cargar más comentarios"}
					</button>
				</div>
			)}
		</section>
	);
};

export default CommentsSection;
