import { FormEvent, useEffect, useState } from "react";

type Props = {
	onSubmit: (body: string) => Promise<boolean>;
	initialBody?: string;
	placeholder?: string;
	submitting?: boolean;
	onCancel?: () => void;
	compact?: boolean;
};

const MAX_LENGTH = 1000;

const CommentForm = ({
	onSubmit,
	initialBody = "",
	placeholder = "Escribí tu comentario...",
	submitting = false,
	onCancel,
	compact = false,
}: Props) => {
	const [body, setBody] = useState(initialBody);
	const [touched, setTouched] = useState(false);

	useEffect(() => {
		setBody(initialBody);
	}, [initialBody]);

	const trimmed = body.trim();
	const tooShort = trimmed.length > 0 && trimmed.length < 2;
	const canSubmit = trimmed.length >= 2 && body.length <= MAX_LENGTH && !submitting;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setTouched(true);
		if (!canSubmit) return;
		const success = await onSubmit(trimmed);
		if (success) {
			setBody("");
			setTouched(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
				compact ? "" : "shadow-lg shadow-black/10"
			}`}
		>
			<textarea
				value={body}
				onChange={(event) => setBody(event.target.value)}
				onBlur={() => setTouched(true)}
				placeholder={placeholder}
				rows={compact ? 2 : 3}
				maxLength={MAX_LENGTH}
				className="w-full resize-y rounded-xl border border-white/10 bg-c_dark_blue-600/70 px-4 py-3 text-sm text-c_gray-100 placeholder:text-c_gray-900 focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
			/>

			<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
				<span
					className={`text-xs ${
						tooShort && touched ? "text-red-400" : "text-c_gray-900"
					}`}
				>
					{tooShort && touched
						? "El comentario debe tener al menos 2 caracteres."
						: `${body.length}/${MAX_LENGTH}`}
				</span>

				<div className="flex items-center gap-2">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							disabled={submitting}
							className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-c_gray-500 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
						>
							Cancelar
						</button>
					)}
					<button
						type="submit"
						disabled={!canSubmit}
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-c_black transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{submitting ? "Enviando..." : initialBody ? "Guardar" : "Comentar"}
					</button>
				</div>
			</div>
		</form>
	);
};

export default CommentForm;
