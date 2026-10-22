import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, Pencil, Reply, Star, Trash2 } from "lucide-react";
import { IComment } from "@/src/redux/Interfaces";
import { Avatar } from "@/src/components/Avatar";
import { CommentForm } from "./CommentForm";
import { cn } from "@/src/lib/utils";

type Props = {
	comment: IComment;
	onReply?: (commentId: number, body: string) => Promise<boolean>;
	onEdit?: (commentId: number, body: string) => Promise<boolean>;
	onDelete?: (commentId: number) => Promise<boolean>;
	submitting?: boolean;
	isReply?: boolean;
};

const relativeDate = (value: string, locale: string) => {
	const date = new Date(value);
	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
		["year", 60 * 60 * 24 * 365],
		["month", 60 * 60 * 24 * 30],
		["week", 60 * 60 * 24 * 7],
		["day", 60 * 60 * 24],
		["hour", 60 * 60],
		["minute", 60],
	];
	for (const [unit, size] of units) {
		if (Math.abs(seconds) >= size) {
			return formatter.format(Math.round(seconds / size), unit);
		}
	}
	return null;
};

export function CommentItem({
	comment,
	onReply,
	onEdit,
	onDelete,
	submitting = false,
	isReply = false,
}: Props) {
	const { t, i18n } = useTranslation("comments");
	const [replying, setReplying] = useState(false);
	const [editing, setEditing] = useState(false);
	const fullName = `${comment.user.name} ${comment.user.lastname}`.trim();
	const relative = relativeDate(comment.created_at, i18n.language);

	const handleDelete = async () => {
		if (!onDelete) return;
		if (!window.confirm(t("deleteConfirm"))) return;
		await onDelete(comment.id);
	};

	const actionClass =
		"inline-flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary";

	return (
		<motion.article
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			className={cn(
				"rounded-2xl border border-border-subtle bg-surface p-4",
				isReply && "ml-4 sm:ml-10"
			)}
		>
			<div className="flex items-start gap-3">
				<Avatar name={comment.user.name || "?"} src={comment.user.avatar} size={36} />

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<span className="text-sm font-semibold text-text-primary">{fullName}</span>
						<span className="text-xs text-text-muted">
							{relative || t("justNow")}
						</span>
						{comment.is_edited && !comment.is_deleted && (
							<span className="text-xs text-text-muted">· {t("edited")}</span>
						)}
					</div>

					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
						{comment.author_liked && (
							<span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
								<Heart className="h-3 w-3 fill-current" />
								{t("likedBadge")}
							</span>
						)}
						{comment.author_rating != null && (
							<span className="inline-flex items-center gap-1 text-xs font-semibold text-star">
								<Star className="h-3 w-3 fill-current" />
								{comment.author_rating}/5
							</span>
						)}
					</div>

					{comment.is_deleted ? (
						<p className="mt-2 text-sm italic text-text-muted">{t("deleted")}</p>
					) : editing ? (
						<div className="mt-3">
							<CommentForm
								initialBody={comment.body}
								onSubmit={async (body) => {
									if (!onEdit) return false;
									const success = await onEdit(comment.id, body);
									if (success) setEditing(false);
									return success;
								}}
								onCancel={() => setEditing(false)}
								submitting={submitting}
								compact
							/>
						</div>
					) : (
						<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
							{comment.body}
						</p>
					)}

					{!comment.is_deleted && (
						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
							{onReply && !isReply && (
								<button
									type="button"
									onClick={() => setReplying((v) => !v)}
									className={cn(actionClass, "hover:text-accent")}
								>
									<Reply className="h-3.5 w-3.5" />
									{t("reply")}
								</button>
							)}
							{comment.can_edit && onEdit && (
								<button
									type="button"
									onClick={() => setEditing(true)}
									className={cn(actionClass, "hover:text-accent")}
								>
									<Pencil className="h-3.5 w-3.5" />
									{t("edit")}
								</button>
							)}
							{comment.can_edit && onDelete && (
								<button
									type="button"
									onClick={handleDelete}
									className={cn(actionClass, "hover:text-danger")}
								>
									<Trash2 className="h-3.5 w-3.5" />
									{t("delete")}
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{replying && onReply && (
				<div className="mt-3 sm:ml-12">
					<CommentForm
						placeholder={t("replyPlaceholder")}
						onSubmit={async (body) => {
							const success = await onReply(comment.id, body);
							if (success) setReplying(false);
							return success;
						}}
						onCancel={() => setReplying(false)}
						submitting={submitting}
						compact
					/>
				</div>
			)}

			{!isReply && comment.replies && comment.replies.length > 0 && (
				<div className="mt-3 space-y-3">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onEdit={onEdit}
							onDelete={onDelete}
							submitting={submitting}
							isReply
						/>
					))}
				</div>
			)}
		</motion.article>
	);
}
