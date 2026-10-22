import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type Props = {
	onSubmit: (body: string) => Promise<boolean>;
	initialBody?: string;
	placeholder?: string;
	submitting?: boolean;
	onCancel?: () => void;
	compact?: boolean;
};

const MAX_LENGTH = 1000;

export function CommentForm({
	onSubmit,
	initialBody = "",
	placeholder,
	submitting = false,
	onCancel,
	compact = false,
}: Props) {
	const { t } = useTranslation("comments");
	const [body, setBody] = useState(initialBody);
	const [touched, setTouched] = useState(false);

	useEffect(() => setBody(initialBody), [initialBody]);

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
			className={cn(
				"rounded-2xl border border-border-subtle bg-surface p-4",
				!compact && "shadow-card"
			)}
		>
			<textarea
				value={body}
				onChange={(e) => setBody(e.target.value)}
				onBlur={() => setTouched(true)}
				placeholder={placeholder ?? t("placeholder")}
				rows={compact ? 2 : 3}
				maxLength={MAX_LENGTH}
				className="w-full resize-y rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
			/>

			<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
				<span
					className={cn(
						"text-xs",
						tooShort && touched ? "text-danger" : "text-text-muted"
					)}
				>
					{tooShort && touched
						? t("tooShort")
						: `${body.length}/${MAX_LENGTH}`}
				</span>

				<div className="flex items-center gap-2">
					{onCancel && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onCancel}
							disabled={submitting}
						>
							{t("cancel", { ns: "common" })}
						</Button>
					)}
					<Button type="submit" size="sm" disabled={!canSubmit}>
						{submitting
							? t("sending")
							: initialBody
								? t("save", { ns: "common" })
								: t("post")}
					</Button>
				</div>
			</div>
		</form>
	);
}
