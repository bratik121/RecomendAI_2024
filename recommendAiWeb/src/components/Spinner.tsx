import { cn } from "@/src/lib/utils";

/** Inline CSS spinner for buttons and small loading states. */
export function Spinner({ className }: { className?: string }) {
	return (
		<span
			role="status"
			aria-label="Cargando"
			className={cn(
				"inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
				className
			)}
		/>
	);
}
