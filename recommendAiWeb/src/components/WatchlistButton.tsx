import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { useWatchlist } from "@/src/redux/hooks/useWatchlist";
import { cn } from "@/src/lib/utils";

type Props = {
	movieId: number;
	className?: string;
	variant?: "icon" | "pill";
};

export function WatchlistButton({ movieId, className, variant = "icon" }: Props) {
	const { t } = useTranslation("movie");
	const navigate = useNavigate();
	const isAuthenticated = useSelector(
		(state: RootState) => state.user.isAuthenticated
	);
	const { isInWatchlist, itemByMovieId, add, remove, loading } = useWatchlist();

	const added = isInWatchlist(movieId);

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		event.preventDefault();
		if (!isAuthenticated) {
			navigate("/sign/in");
			return;
		}
		const existing = itemByMovieId(movieId);
		if (existing) remove(existing.id);
		else add(movieId);
	};

	const label = added ? t("removeFromWatchlist") : t("addToWatchlist");

	if (variant === "pill") {
		return (
			<motion.button
				type="button"
				whileTap={{ scale: 0.96 }}
				disabled={loading}
				onClick={handleClick}
				aria-label={label}
				title={label}
				className={cn(
					"inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
					added
						? "border-accent/40 bg-accent-soft text-accent"
						: "border-border-subtle bg-surface text-text-primary hover:border-accent/40 hover:text-accent",
					className
				)}
			>
				{added ? (
					<BookmarkCheck className="h-4 w-4" />
				) : (
					<Bookmark className="h-4 w-4" />
				)}
				<span className="hidden sm:inline">{added ? t("inWatchlist") : t("addToWatchlist")}</span>
			</motion.button>
		);
	}

	return (
		<motion.button
			type="button"
			whileTap={{ scale: 0.88 }}
			disabled={loading}
			onClick={handleClick}
			aria-label={label}
			title={label}
			className={cn(
				"inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-black/60 text-text-secondary shadow-lg backdrop-blur-md transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50",
				added && "border-accent/50 bg-accent-soft text-accent",
				className
			)}
		>
			<motion.span
				key={added ? "on" : "off"}
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", stiffness: 400, damping: 22 }}
				className="flex"
			>
				{added ? (
					<BookmarkCheck className="h-4 w-4" />
				) : (
					<Bookmark className="h-4 w-4" />
				)}
			</motion.span>
		</motion.button>
	);
}
