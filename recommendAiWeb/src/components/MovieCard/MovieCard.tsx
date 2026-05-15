import { IMovie } from "@/src/redux/Interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";

type Props = {
	movie: IMovie;
	handleRateMovie?: (id_movie: number) => void;
};

const itemVariants = {
	hidden: { opacity: 0, y: 24 },
	show: { opacity: 1, y: 0 },
};

const getPosterUrl = (posterPath?: string) => {
	if (!posterPath) return "/placeholder-movie.jpg";

	if (posterPath.startsWith("http")) {
		return posterPath;
	}

	return `https://image.tmdb.org/t/p/w500/${posterPath}`;
};

const MovieCard = ({ movie, handleRateMovie }: Props) => {
	const [isHovered, setIsHovered] = useState(false);

	const rating = Number(movie.vote_average || 0).toFixed(1);
	const genres = movie.genres || [];

	return (
		<motion.article
			key={movie.id}
			variants={itemVariants}
			whileHover={{ y: -10, scale: 1.015 }}
			className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-c_dark_blue-400/95 to-c_dark_blue-600/95 shadow-xl shadow-black/25 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/40 hover:shadow-[0_24px_60px_rgba(9,217,158,0.14)]"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
				<div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
				<div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-primary-400/10 blur-3xl" />
			</div>

			<div className="relative overflow-hidden">
				<div className="relative h-80 w-full overflow-hidden bg-c_dark_blue-600">
					<img
						src={getPosterUrl(movie.poster_path)}
						alt={movie.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
					/>

					<div className="absolute inset-0 bg-gradient-to-t from-c_black via-c_black/20 to-transparent opacity-90" />
					<div className="absolute inset-0 bg-gradient-to-b from-c_black/30 via-transparent to-transparent" />

					<div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-c_black/55 px-3 py-1.5 text-xs font-semibold text-c_gray-200 shadow-lg backdrop-blur-md">
						<IoCalendarOutline className="h-3.5 w-3.5 text-primary-400" />
						<span>{movie.release_year || "N/A"}</span>
					</div>

					<div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-c_black/55 px-3 py-1.5 text-xs font-bold text-c_gray-100 shadow-lg backdrop-blur-md">
						<FaStar className="h-3.5 w-3.5 text-yellow-400" />
						<span>{rating}</span>
					</div>

			

					<div className="absolute bottom-0 left-0 right-0 p-4">
						<h3 className="line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow-lg transition-colors duration-300 group-hover:text-primary-300">
							{movie.title}
						</h3>
					</div>

					<AnimatePresence>
						{isHovered && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0 flex flex-col justify-end bg-black/50 p-5 backdrop-blur-sm"
							>
                		{handleRateMovie && (
						<motion.button
							type="button"
							aria-label={movie.liked ? "Remove from favorites" : "Add to favorites"}
							className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-c_black/65 text-c_gray-300 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-primary-500/40 hover:bg-primary-500 hover:text-c_black"
							whileTap={{ scale: 0.88 }}
							onClick={(event) => {
								event.stopPropagation();
								handleRateMovie(movie.id);
							}}
						>
							{movie.liked ? (
								<FaHeart className="h-5 w-5 text-primary-400 transition-colors group-hover:text-primary-300" />
							) : (
								<FaRegHeart className="h-5 w-5" />
							)}
						</motion.button>
					)}
								<motion.div
									initial={{ y: 18, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 18, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
										Overview
									</p>

									<p className="line-clamp-7 text-sm leading-relaxed text-c_gray-200 line-clamp-6">
										{movie.overview || "No overview available for this movie."}
									</p>
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="relative z-10 space-y-4 p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
						<FaStar className="h-4 w-4 text-yellow-400" />
						<span className="text-sm font-bold text-c_gray-100">{rating}</span>
						<span className="text-xs text-c_gray-500">/10</span>
					</div>
				</div>

				<div className="flex min-h-[58px] flex-wrap gap-2">
					{genres.slice(0, 3).map((genre) => (
						<span
							key={`${movie.id}-${genre}`}
							className="rounded-full border border-primary-500/15 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-100 transition-colors duration-300 group-hover:border-primary-500/30 group-hover:bg-primary-500/15 max-w-fit max-h-fit"
						>
							{genre}
						</span>
					))}

					{genres.length > 3 && (
						<span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-c_gray-300">
							+{genres.length - 3}
						</span>
					)}

					{genres.length === 0 && (
						<span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-c_gray-400">
							No genres
						</span>
					)}
				</div>

				<div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<div className="flex items-center justify-between">
					<span className="text-xs font-medium uppercase tracking-[0.18em] text-c_gray-500">
						Movie Pick
					</span>

					<span className="text-xs font-semibold text-primary-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						View details
					</span>
				</div>
			</div>
		</motion.article>
	);
};

export default MovieCard;