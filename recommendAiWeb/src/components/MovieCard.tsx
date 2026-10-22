import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Heart, Star } from "lucide-react";
import { IMovie } from "@/src/redux/Interfaces";
import { getPosterUrl } from "@/src/utils";
import { cn } from "@/src/lib/utils";
import { WatchlistButton } from "@/src/components/WatchlistButton";

type Props = {
	movie: IMovie;
	onLike?: (id_movie: number) => void;
	className?: string;
};

/**
 * Canonical poster card used in Search and Recommendation grids.
 * Poster-forward with a hover "spotlight" that reveals the synopsis and
 * actions. Focusable and keyboard-operable (role="link").
 */
export function MovieCard({ movie, onLike, className }: Props) {
	const [hovered, setHovered] = useState(false);
	const navigate = useNavigate();
	const rating = Number(movie.vote_average * 10 || 0).toFixed(1);

	const openDetail = () => navigate(`/movie/${movie.id}`);

	return (
		<motion.article
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
			}}
			whileHover={{ y: -6 }}
			role="link"
			tabIndex={0}
			aria-label={`Ver detalle de ${movie.title}`}
			onClick={openDetail}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openDetail();
				}
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			className={cn(
				"group relative cursor-pointer overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-accent/40",
				className
			)}
		>
			<div className="relative aspect-[2/3] overflow-hidden">
				<img
					src={getPosterUrl(movie.poster_path, "w500")}
					alt={movie.title}
					loading="lazy"
					className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

				{/* Badges */}
				<div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
					<Calendar className="h-3 w-3 text-accent" />
					{movie.release_year || "—"}
				</div>
				<div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
					<Star className="h-3 w-3 fill-star text-star" />
					{rating}
				</div>

				{/* Bottom title */}
				<div className="absolute inset-x-0 bottom-0 p-4">
					<h3 className="line-clamp-2 text-base font-bold leading-snug text-white drop-shadow">
						{movie.title}
					</h3>
				</div>

				{/* Hover spotlight: synopsis + actions */}
				<AnimatePresence>
					{hovered && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 flex flex-col justify-end bg-black/60 p-4 backdrop-blur-sm"
						>
							<div className="absolute right-3 top-3 flex flex-col gap-2">
								<WatchlistButton movieId={movie.id} />
								{onLike && (
									<button
										type="button"
										aria-label={movie.liked ? "Quitar de favoritos" : "Agregar a favoritos"}
										onClick={(e) => {
											e.stopPropagation();
											onLike(movie.id);
										}}
										className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-black/60 text-text-secondary backdrop-blur-md transition-colors hover:border-danger/50 hover:text-danger"
									>
										<Heart
											className="h-4 w-4"
											fill={movie.liked ? "currentColor" : "none"}
										/>
									</button>
								)}
							</div>
							<div>
								<p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
									Sinopsis
								</p>
								<p className="line-clamp-5 text-xs leading-relaxed text-white/90">
									{movie.overview || "Sin sinopsis disponible."}
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.article>
	);
}
