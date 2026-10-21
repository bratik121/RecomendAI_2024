import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { Loading } from "@/src/components/common";
import { CommentsSection } from "@/src/components/Comments";
import { useFetchMovieById } from "@/src/redux/hooks/useFetchMovieById";
import { getPosterUrl } from "@/src/utils";

const Stat = ({ label, value }: { label: string; value: string }) => (
	<div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
		<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-c_gray-900">
			{label}
		</p>
		<p className="mt-1 text-lg font-bold text-white">{value}</p>
	</div>
);

const MovieDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { movie, loading, error, notFound } = useFetchMovieById(id);

	useEffect(() => {
		document.title = movie ? `${movie.title} · What2Watch` : "What2Watch";
		return () => {
			document.title = "What2Watch";
		};
	}, [movie]);

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<Loading />
			</div>
		);
	}

	if (notFound || error || !movie) {
		return (
			<div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
				<p className="text-5xl">🎬</p>
				<h1 className="mt-5 font-custom text-3xl font-bold text-white">
					{notFound ? "Película no encontrada" : "Algo salió mal"}
				</h1>
				<p className="mt-2 text-c_gray-500">
					{notFound
						? "La película que buscás no existe o fue eliminada del catálogo."
						: error}
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-3">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-primary-500/50"
					>
						Volver
					</button>
					<Link
						to="/search"
						className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-c_black transition-colors hover:bg-primary-400"
					>
						Descubrir películas
					</Link>
				</div>
			</div>
		);
	}

	const rating = Number(movie.vote_average * 10 || 0).toFixed(1);
	const popularity = Number(movie.popularity * 100 || 0).toFixed(1);
	const revenue = Number(movie.revenue * 100 || 0).toFixed(2);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className="relative min-h-screen w-full overflow-hidden"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden opacity-30">
				<img
					src={getPosterUrl(movie.poster_path, "w780")}
					alt=""
					className="h-full w-full scale-110 object-cover blur-3xl"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-c_dark_blue-600/60 to-c_dark_blue-600" />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-c_dark_blue-600/60 px-4 py-2 text-sm font-medium text-c_gray-200 backdrop-blur-sm transition-colors hover:border-primary-500/40 hover:text-white"
				>
					<FaArrowLeft className="h-3.5 w-3.5" />
					Volver
				</button>

				<div className="grid gap-8 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] lg:gap-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mx-auto w-full max-w-[320px]"
					>
						<div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40">
							<img
								src={getPosterUrl(movie.poster_path, "w500")}
								alt={movie.title}
								className="aspect-[2/3] w-full object-cover"
							/>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.08 }}
						className="min-w-0"
					>
						<div className="flex flex-wrap items-center gap-3 text-sm text-c_gray-500">
							<span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
								<IoCalendarOutline className="h-4 w-4 text-primary-400" />
								{movie.release_year || "Año desconocido"}
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1.5 font-semibold text-yellow-200">
								<FaStar className="h-4 w-4 text-yellow-400" />
								{rating}/10
							</span>
						</div>

						<h1 className="mt-5 font-custom text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
							{movie.title}
						</h1>

						<div className="mt-5 flex flex-wrap gap-2">
							{movie.genres?.length ? (
								movie.genres.map((genre) => (
									<span
										key={genre}
										className="rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200"
									>
										{genre}
									</span>
								))
							) : (
								<span className="text-sm text-c_gray-900">Sin géneros</span>
							)}
						</div>

						<p className="mt-7 max-w-3xl text-base leading-relaxed text-c_gray-200 sm:text-lg">
							{movie.overview || "No hay sinopsis disponible para esta película."}
						</p>

						<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
							<Stat label="Popularidad relativa" value={`${popularity}%`} />
							<Stat
								label="Votos"
								value={movie.vote_average ? `${rating}/10` : "Sin datos"}
							/>
							<Stat
								label="Ingresos relativos"
								value={movie.revenue > 0 ? `${revenue}%` : "Sin datos"}
							/>
						</div>
					</motion.div>
				</div>

				<CommentsSection movieId={id} />
			</div>
		</motion.div>
	);
};

export default MovieDetail;
