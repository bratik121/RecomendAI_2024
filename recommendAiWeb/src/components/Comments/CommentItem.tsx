import { useState } from "react";
import { motion } from "framer-motion";
import { FaReply, FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { IComment } from "@/src/redux/Interfaces";
import CommentForm from "./CommentForm";

type Props = {
	comment: IComment;
	onReply?: (commentId: number, body: string) => Promise<boolean>;
	onEdit?: (commentId: number, body: string) => Promise<boolean>;
	onDelete?: (commentId: number) => Promise<boolean>;
	submitting?: boolean;
	isReply?: boolean;
};

const relativeDate = (value: string) => {
	const date = new Date(value);
	const seconds = Math.round((date.getTime() - Date.now()) / 1000);
	const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

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
	return "recién";
};

const Avatar = ({ name }: { name: string }) => (
	<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 text-sm font-bold text-primary-300">
		{name.charAt(0).toUpperCase()}
	</div>
);

const CommentItem = ({
	comment,
	onReply,
	onEdit,
	onDelete,
	submitting = false,
	isReply = false,
}: Props) => {
	const [replying, setReplying] = useState(false);
	const [editing, setEditing] = useState(false);
	const fullName = `${comment.user.name} ${comment.user.lastname}`.trim();

	const handleDelete = async () => {
		if (!onDelete) return;
		if (!window.confirm("¿Querés eliminar este comentario?")) return;
		await onDelete(comment.id);
	};

	return (
		<motion.article
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			className={`rounded-2xl border border-white/10 bg-c_dark_blue-400/40 p-4 ${
				isReply ? "ml-5 sm:ml-10" : ""
			}`}
		>
			<div className="flex items-start gap-3">
				<Avatar name={comment.user.name || "?"} />

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<span className="text-sm font-semibold text-white">{fullName}</span>
						<span className="text-xs text-c_gray-900">
							{relativeDate(comment.created_at)}
						</span>
						{comment.is_edited && !comment.is_deleted && (
							<span className="text-xs text-c_gray-900">· editado</span>
						)}
					</div>

					{comment.is_deleted ? (
						<p className="mt-2 text-sm italic text-c_gray-900">
							Este comentario fue eliminado.
						</p>
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
						<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-c_gray-200">
							{comment.body}
						</p>
					)}

					{!comment.is_deleted && (
						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-c_gray-500">
							{onReply && !isReply && (
								<button
									type="button"
									onClick={() => setReplying((value) => !value)}
									className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-400"
								>
									<FaReply className="h-3.5 w-3.5" />
									Responder
								</button>
							)}
							{comment.can_edit && onEdit && (
								<button
									type="button"
									onClick={() => setEditing(true)}
									className="inline-flex items-center gap-1.5 transition-colors hover:text-primary-400"
								>
									<FaRegEdit className="h-3.5 w-3.5" />
									Editar
								</button>
							)}
							{comment.can_edit && onDelete && (
								<button
									type="button"
									onClick={handleDelete}
									className="inline-flex items-center gap-1.5 transition-colors hover:text-red-400"
								>
									<FaRegTrashAlt className="h-3.5 w-3.5" />
									Eliminar
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{replying && onReply && (
				<div className="mt-3 sm:ml-12">
					<CommentForm
						placeholder="Escribí una respuesta..."
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
};

export default CommentItem;
