import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Film, Star } from "lucide-react";
import { useFetchMovieById } from "@/src/redux/hooks/useFetchMovieById";
import { useRating } from "@/src/redux/hooks/useRating";
import { getPosterUrl } from "@/src/utils";
import { Loading } from "@/src/components/Loading";
import { EmptyState } from "@/src/components/EmptyState";
import { CommentsSection } from "@/src/components/Comments";
import { WatchlistButton } from "@/src/components/WatchlistButton";
import { StarRating } from "@/src/components/StarRating";
import { Button } from "@/src/components/ui/button";
import { fadeUp } from "@/src/lib/motion";

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3">
			<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
				{label}
			</p>
			<p className="mt-1 text-lg font-bold text-text-primary">{value}</p>
		</div>
	);
}

export function MovieDetail() {
	const { t } = useTranslation("movie");
	const { id } = useParams();
	const navigate = useNavigate();
	const { movie, loading, error, notFound } = useFetchMovieById(id);
	const { summary, submitting, error: ratingError, submit } = useRating(id);

	useEffect(() => {
		document.title = movie ? `${movie.title} · What2Watch` : "What2Watch";
		return () => {
			document.title = "What2Watch";
		};
	}, [movie]);

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center">
				<Loading label="Cargando película..." />
			</div>
		);
	}

	if (notFound || error || !movie) {
		return (
			<div className="mx-auto max-w-xl px-4 py-16">
				<EmptyState
					icon={<Film className="h-7 w-7" />}
					title={notFound ? t("notFound") : t("error")}
					description={notFound ? t("notFoundDesc") : error}
					action={
						<div className="flex gap-3">
							<Button variant="outline" onClick={() => navigate(-1)}>
								{t("back")}
							</Button>
							<Link to="/search">
								<Button>{t("discover")}</Button>
							</Link>
						</div>
					}
				/>
			</div>
		);
	}

	const rating = Number(movie.vote_average * 10 || 0).toFixed(1);
	const popularity = Number(movie.popularity * 100 || 0).toFixed(1);
	const revenue = Number(movie.revenue * 100 || 0).toFixed(2);
	const userScore = summary?.user_rating?.score ?? movie.user_rating?.score ?? 0;
	const communityAverage = movie.average_rating ?? summary?.average ?? null;

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			{/* Backdrop */}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden opacity-30">
				<img
					src={getPosterUrl(movie.poster_path, "w780")}
					alt=""
					className="h-full w-full scale-110 object-cover blur-3xl"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
				>
					<ArrowLeft className="h-4 w-4" />
					{t("back")}
				</button>

				<div className="grid gap-8 md:grid-cols-[260px_1fr] lg:grid-cols-[320px_1fr] lg:gap-12">
					<motion.div variants={fadeUp} initial="hidden" animate="visible" className="mx-auto w-full max-w-[320px]">
						<div className="relative overflow-hidden rounded-3xl border border-border-subtle shadow-float">
							<img
								src={getPosterUrl(movie.poster_path, "w500")}
								alt={movie.title}
								className="aspect-[2/3] w-full object-cover"
							/>
							<div className="absolute right-3 top-3">
								<WatchlistButton movieId={movie.id} />
							</div>
						</div>
					</motion.div>

					<motion.div
						variants={fadeUp}
						initial="hidden"
						animate="visible"
						className="min-w-0"
					>
						<div className="flex flex-wrap items-center gap-3 text-sm">
							<span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-text-secondary">
								<Calendar className="h-4 w-4 text-accent" />
								{movie.release_year || t("unknownYear", { ns: "common" })}
							</span>
							<span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-semibold text-text-primary">
								<Star className="h-4 w-4 fill-star text-star" />
								{rating}/10
							</span>
						</div>

						<h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl">
							{movie.title}
						</h1>

						<div className="mt-5 flex flex-wrap gap-2">
							{movie.genres?.length ? (
								movie.genres.map((genre) => (
									<span
										key={genre}
										className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
									>
										{genre}
									</span>
								))
							) : (
								<span className="text-sm text-text-muted">
									{t("noGenres", { ns: "common" })}
								</span>
							)}
						</div>

						<p className="mt-7 max-w-3xl text-base leading-relaxed text-text-secondary sm:text-lg">
							{movie.overview || t("noOverview", { ns: "common" })}
						</p>

						<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
							<Stat label={t("popularity")} value={`${popularity}%`} />
							<Stat
								label={t("votes")}
								value={movie.vote_average ? `${rating}/10` : t("notAvailable", { ns: "common" })}
							/>
							<Stat
								label={t("revenue")}
								value={movie.revenue > 0 ? `${revenue}%` : t("notAvailable", { ns: "common" })}
							/>
						</div>

						{/* Rating card */}
						<div className="mt-8 rounded-2xl border border-border-subtle bg-surface p-5">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
										{t("rating")}
									</p>
									<div className="mt-2">
										<StarRating value={userScore} onChange={submit} size={26} />
										{submitting && (
											<span className="ml-2 text-xs text-text-muted">Guardando…</span>
										)}
									</div>
								</div>
								<div className="text-right">
									<p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
										{t("communityRating")}
									</p>
									<p className="mt-1 flex items-center justify-end gap-2 text-xl font-bold text-text-primary">
										<Star className="h-5 w-5 fill-star text-star" />
										{communityAverage != null ? communityAverage : "—"}
									</p>
									<p className="text-xs text-text-muted">
										{t("votesCount", {
											count: movie.ratings_count ?? summary?.count ?? 0,
										})}
									</p>
								</div>
							</div>
							{ratingError && (
								<p className="mt-3 text-sm text-danger">{ratingError}</p>
							)}
						</div>
					</motion.div>
				</div>

				<CommentsSection movieId={id} />
			</div>
		</div>
	);
}
