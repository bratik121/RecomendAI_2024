import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { fadeUp } from "@/src/lib/motion";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type Props = {
	title: string;
	description?: string;
	onRetry?: () => void;
	className?: string;
};

/** Reusable error state with an optional retry action. */
export function ErrorState({
	title,
	description,
	onRetry,
	className,
}: Props) {
	return (
		<motion.div
			variants={fadeUp}
			initial="hidden"
			animate="visible"
			className={cn(
				"flex flex-col items-center justify-center rounded-2xl border border-danger-soft bg-surface/40 px-6 py-16 text-center",
				className
			)}
		>
			<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
				<TriangleAlert className="h-7 w-7" />
			</div>
			<h3 className="text-lg font-bold text-text-primary">{title}</h3>
			{description && (
				<p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-muted">
					{description}
				</p>
			)}
			{onRetry && (
				<Button variant="outline" className="mt-6" onClick={onRetry}>
					Reintentar
				</Button>
			)}
		</motion.div>
	);
}
