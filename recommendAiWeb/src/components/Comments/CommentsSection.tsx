import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { userLogout } from "@/src/redux/actions";
import { useComments } from "@/src/redux/hooks/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/EmptyState";
import { staggerContainer } from "@/src/lib/motion";

type Props = {
	movieId?: string;
};

export function CommentsSection({ movieId }: Props) {
	const { t } = useTranslation("comments");
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
		<section id="comments" className="mt-16 border-t border-border-subtle pt-10">
			<div className="mb-8">
				<h2 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
					<MessageSquare className="h-6 w-6 text-accent" />
					{t("title")}
					<span className="text-base font-medium text-text-muted">({count})</span>
				</h2>
			</div>

			{isAuthenticated ? (
				<div className="mb-8">
					<CommentForm
						onSubmit={(body) => createComment(body, null)}
						submitting={submitting}
						placeholder={t("placeholder")}
					/>
				</div>
			) : (
				<div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-soft bg-accent-soft/50 p-5">
					<p className="text-sm text-text-secondary">{t("loginPrompt")}</p>
					<Link to="/sign/in">
						<Button size="sm">{t("login")}</Button>
					</Link>
				</div>
			)}

			{error && (
				<div className="mb-6 rounded-xl border border-danger-soft bg-danger-soft/60 px-4 py-3 text-sm text-danger">
					{error}
				</div>
			)}

			{loading && comments.length === 0 ? (
				<div className="space-y-3">
					{[1, 2, 3].map((item) => (
						<Skeleton key={item} className="h-24 w-full rounded-2xl" />
					))}
				</div>
			) : comments.length === 0 ? (
				<EmptyState
					icon={<MessageSquare className="h-7 w-7" />}
					title={t("empty")}
					description={isAuthenticated ? t("emptyFirst") : t("emptyLogin")}
				/>
			) : (
				<motion.div
					variants={staggerContainer(0.05)}
					initial="hidden"
					animate="visible"
					className="space-y-4"
				>
					<AnimatePresence>
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
					</AnimatePresence>
				</motion.div>
			)}

			{hasNext && (
				<div className="mt-6 flex justify-center">
					<Button
						variant="outline"
						onClick={() => fetchPage(page + 1)}
						disabled={loading}
					>
						{loading ? t("loading") : t("loadMore")}
					</Button>
				</div>
			)}
		</section>
	);
}
