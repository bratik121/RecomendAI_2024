import { useState } from "react";
import { Link } from "react-router-dom";
import {
	motion,
	useMotionValue,
	useTransform,
	type PanInfo,
} from "framer-motion";
import { Check, ChevronRight, Trash2 } from "lucide-react";
import { IWatchlistItem } from "@/src/redux/Interfaces";
import { getPosterUrl } from "@/src/utils";

type Props = {
	item: IWatchlistItem;
	onWatched: () => void;
	onRemove: () => void;
};

const THRESHOLD = 110;

/**
 * A single row in the watchlist. Draggable horizontally:
 *  - right → mark as watched (accent)
 *  - left  → remove from watchlist (danger)
 * Buttons stay available for keyboard/desktop users.
 */
export function WatchlistRow({ item, onWatched, onRemove }: Props) {
	const x = useMotionValue(0);
	const [exitX, setExitX] = useState(0);

	const seenOpacity = useTransform(x, [0, THRESHOLD], [0, 1]);
	const removeOpacity = useTransform(x, [-THRESHOLD, 0], [1, 0]);

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		if (info.offset.x > THRESHOLD || info.velocity.x > 600) {
			setExitX(1);
			onWatched();
			return;
		}
		if (info.offset.x < -THRESHOLD || info.velocity.x < -600) {
			setExitX(-1);
			onRemove();
			return;
		}
	};

	return (
		<motion.li
			layout
			exit={{
				opacity: 0,
				x: exitX * 220,
				transition: { duration: 0.22, ease: "easeIn" },
			}}
			className="relative overflow-hidden rounded-2xl border border-border-subtle"
		>
			{/* Reveal background: left = remove (danger), right = watched (accent) */}
			{/* Fondo revelado */}
			<div className="absolute inset-0 flex">
				{/* Lado IZQUIERDO → se revela al arrastrar a la DERECHA → "Vista" (verde) */}
				<motion.div
					style={{ opacity: seenOpacity }}
					className="flex flex-1 items-center justify-start gap-2 bg-accent px-6 text-accent-foreground"
				>
					<Check className="h-6 w-6" strokeWidth={3} />
					<span className="text-sm font-bold">Vista</span>
				</motion.div>

				{/* Lado DERECHO → se revela al arrastrar a la IZQUIERDA → "Quitar" (rojo) */}
				<motion.div
					style={{ opacity: removeOpacity }}
					className="flex flex-1 items-center justify-end gap-2 bg-danger px-6 text-white"
				>
					<span className="text-sm font-bold">Quitar</span>
					<Trash2 className="h-6 w-6" strokeWidth={2.5} />
				</motion.div>
			</div>

			{/* Foreground row */}
			<motion.div
				style={{ x }}
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.6}
				dragDirectionLock
				onDragEnd={handleDragEnd}
				className="relative flex cursor-grab items-center gap-4 bg-surface p-3 active:cursor-grabbing"
			>
				<Link to={`/movie/${item.movie.id}`} className="shrink-0">
					<img
						src={getPosterUrl(item.movie.poster_path, "w342")}
						alt={item.movie.title}
						draggable={false}
						className="h-20 w-14 rounded-lg object-cover"
					/>
				</Link>

				<div className="min-w-0 flex-1">
					<Link
						to={`/movie/${item.movie.id}`}
						className="line-clamp-1 text-base font-semibold text-text-primary hover:text-accent"
					>
						{item.movie.title}
					</Link>
					<p className="mt-0.5 text-xs text-text-muted">
						{item.movie.release_year || "—"}
						{item.movie.genres?.length
							? ` · ${item.movie.genres.slice(0, 2).join(", ")}`
							: ""}
					</p>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onClick={onWatched}
						aria-label="Marcar como vista"
						title="Marcar como vista"
						className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:border-accent/50 hover:bg-accent-soft hover:text-accent"
					>
						<Check className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={onRemove}
						aria-label="Quitar de la watchlist"
						title="Quitar de la watchlist"
						className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:border-danger/50 hover:bg-danger-soft hover:text-danger"
					>
						<Trash2 className="h-4 w-4" />
					</button>
					<Link
						to={`/movie/${item.movie.id}`}
						aria-label={`Ver detalle de ${item.movie.title}`}
						className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
					>
						<ChevronRight className="h-4 w-4" />
					</Link>
				</div>
			</motion.div>
		</motion.li>
	);
}
