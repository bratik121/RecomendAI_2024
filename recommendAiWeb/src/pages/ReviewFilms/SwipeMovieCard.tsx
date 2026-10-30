import {
	motion,
	useMotionValue,
	useTransform,
	type PanInfo,
} from "framer-motion";
import { Calendar, Check, Star, X } from "lucide-react";
import { getPosterUrl } from "@/src/utils";

type Movie = {
	id: number;
	title: string;
	poster_path: string;
	genres: string[];
	release_year: string;
	vote_average: number;
};

type Props = {
	movie: Movie;
	onLike: () => void;
	onDislike: () => void;
};

const SWIPE_THRESHOLD = 120;

export function SwipeMovieCard({ movie, onLike, onDislike }: Props) {
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

	const background = useTransform(
		x,
		[-180, 0, 180],
		[
			"rgba(248, 113, 113, 0.22)",
			"rgba(0, 0, 0, 0)",
			"rgba(23, 214, 162, 0.22)",
		]
	);
	const likeOpacity = useTransform(x, [30, 150], [0, 1]);
	const dislikeOpacity = useTransform(x, [-30, -150], [0, 1]);
	const likeScale = useTransform(x, [30, 150], [0.8, 1.1]);
	const dislikeScale = useTransform(x, [-30, -150], [0.8, 1.1]);

	const rating = Number(movie.vote_average * 10 || 0).toFixed(1);

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		const { offset, velocity } = info;
		if (offset.x > SWIPE_THRESHOLD || velocity.x > 700) {
			onLike();
			return;
		}
		if (offset.x < -SWIPE_THRESHOLD || velocity.x < -700) {
			onDislike();
			return;
		}
	};

	return (
		<motion.div
			className="relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-border-subtle"
			style={{ background }}
		>
			{/* Feedback badges */}
			<motion.div
				style={{ opacity: likeOpacity, scale: likeScale }}
				className="pointer-events-none absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent bg-accent-soft text-accent"
			>
				<Check className="h-6 w-6" strokeWidth={3} />
			</motion.div>
			<motion.div
				style={{ opacity: dislikeOpacity, scale: dislikeScale }}
				className="pointer-events-none absolute left-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-danger bg-danger-soft text-danger"
			>
				<X className="h-6 w-6" strokeWidth={3} />
			</motion.div>

			<motion.div
				className="cursor-grab active:cursor-grabbing"
				style={{ x, rotate }}
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.6}
				onDragEnd={handleDragEnd}
				whileTap={{ scale: 0.97 }}
				initial={{ opacity: 0, y: 40, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
				transition={{ type: "spring", stiffness: 260, damping: 24 }}
			>
				<div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl border border-border-subtle bg-surface">
					<img
						src={getPosterUrl(movie.poster_path, "w500")}
						alt={movie.title}
						className="h-full w-full object-cover"
						draggable={false}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

					<div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
						<Calendar className="h-3 w-3 text-accent" />
						{movie.release_year || "—"}
					</div>
					<div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
						<Star className="h-3 w-3 fill-star text-star" />
						{rating}
					</div>

					<div className="absolute inset-x-0 bottom-0 p-5">
						<h2 className="text-2xl font-extrabold leading-tight text-white drop-shadow">
							{movie.title}
						</h2>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{movie.genres?.slice(0, 3).map((genre) => (
								<span
									key={genre}
									className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
								>
									{genre}
								</span>
							))}
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
