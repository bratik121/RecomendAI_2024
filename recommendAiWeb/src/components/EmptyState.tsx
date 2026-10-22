import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/src/lib/motion";
import { cn } from "@/src/lib/utils";

type Props = {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

/**
 * Reusable empty state — used by Search, Watchlist and Comments so the
 * "nothing here yet" moment feels deliberate instead of broken.
 */
export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: Props) {
	return (
		<motion.div
			variants={fadeUp}
			initial="hidden"
			animate="visible"
			className={cn(
				"flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface/40 px-6 py-16 text-center",
				className
			)}
		>
			{icon && (
				<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
					{icon}
				</div>
			)}
			<h3 className="text-lg font-bold text-text-primary">{title}</h3>
			{description && (
				<p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-muted">
					{description}
				</p>
			)}
			{action && <div className="mt-6">{action}</div>}
		</motion.div>
	);
}
