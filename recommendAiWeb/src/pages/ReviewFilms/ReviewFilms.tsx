import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { RootState } from "@/src/redux/reducers";
import { IReview, IRate_Movies } from "@/src/redux/Interfaces";
import {
	post10MoviesProcess,
	postRate10MoviesProcess,
} from "@/src/redux/actions";
import { SwipeMovieCard } from "./SwipeMovieCard";
import { MovieCard } from "@/src/components/MovieCard";
import { Loading } from "@/src/components/Loading";
import { ErrorState } from "@/src/components/ErrorState";
import { Button } from "@/src/components/ui/button";
import { staggerContainer } from "@/src/lib/motion";

export function ReviewFilms() {
	const [ratedMovies, setRatedMovies] = useState<IReview[]>([]);
	const [isBatchComplete, setIsBatchComplete] = useState(false);
	const [index, setIndex] = useState(0);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);
	const { movies, isFetching, error } = useSelector(
		(state: RootState) => state.movie
	);

	useEffect(() => {
		if (
			isAuthenticated &&
			user?.id &&
			!isBatchComplete &&
			movies.length === 0
		) {
			dispatch(post10MoviesProcess(parseInt(user.id)));
		}
	}, [user.id, isAuthenticated, isBatchComplete, movies.length, dispatch]);

	const submitBatch = (finalRatedMovies: IReview[]) => {
		setIsBatchComplete(true);
		const data: IRate_Movies = {
			id_user: parseInt(user.id),
			reviews: finalRatedMovies,
		};
		dispatch(postRate10MoviesProcess(data));
	};

	const rate = (like: boolean) => {
		const current = movies[index];
		if (!current) return;
		const next = [...ratedMovies, { id_movie: current.id, like }];
		if (index === movies.length - 1) submitBatch(next);
		else {
			setRatedMovies(next);
			setIndex(index + 1);
		}
	};

	if (isFetching || !movies || movies.length === 0) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loading label="Preparando películas..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-xl px-4 py-16">
				<ErrorState
					title="No pudimos cargar las películas"
					description={error}
					onRetry={() => user?.id && dispatch(post10MoviesProcess(parseInt(user.id)))}
				/>
			</div>
		);
	}

	if (isBatchComplete) {
		return (
			<div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center px-4 py-16 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: "spring", bounce: 0.35, duration: 0.8 }}
					className="flex max-w-3xl flex-col items-center"
				>
					<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
						<Sparkles className="h-9 w-9" />
					</div>
					<h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
						Tus recomendaciones están listas
					</h2>
					<p className="mt-4 max-w-2xl text-text-secondary">
						En base a tus calificaciones, RecomendAI seleccionó un nuevo set de
						películas que se ajustan a tu gusto.
					</p>
				</motion.div>

				<motion.div
					variants={staggerContainer(0.04)}
					initial="hidden"
					animate="visible"
					className="mt-12 grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5"
				>
					{movies.slice(0, 10).map((movie) => (
						<MovieCard key={movie.id} movie={movie} />
					))}
				</motion.div>

				<div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button size="lg" onClick={() => navigate("/search")}>
						Descubrir películas
					</Button>
					<Button
						size="lg"
						variant="outline"
						onClick={() => {
							setIsBatchComplete(false);
							setRatedMovies([]);
							setIndex(0);
							if (user?.id) dispatch(post10MoviesProcess(parseInt(user.id)));
						}}
					>
						Calificar otro lote
					</Button>
				</div>
			</div>
		);
	}

	const progress = ((index + 1) / movies.length) * 100;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-8">
			<div className="flex flex-col items-center text-center">
				<h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
					Calificá películas
				</h1>
				<p className="mt-2 max-w-md text-text-secondary">
					Calificá diez películas para recibir recomendaciones personalizadas.
				</p>
			</div>

			{/* Progress */}
			<div className="mt-6 w-full max-w-sm">
				<div className="mb-2 flex justify-between text-sm font-medium text-text-secondary">
					<span>Progreso</span>
					<span className="tabular-nums">
						{index + 1} / {movies.length}
					</span>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
					<motion.div
						initial={false}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="h-full rounded-full bg-accent"
					/>
				</div>
			</div>

			<div className="mt-8 flex w-full flex-col items-center gap-8">
				<div className="flex min-h-[420px] w-full items-center justify-center">
					<AnimatePresence mode="wait">
						{movies[index] && (
							<SwipeMovieCard
								key={movies[index].id}
								movie={movies[index]}
								onLike={() => rate(true)}
								onDislike={() => rate(false)}
							/>
						)}
					</AnimatePresence>
				</div>

				<div className="flex gap-5">
					<motion.button
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => rate(false)}
						aria-label="No me gusta"
						className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-surface text-danger shadow-card transition-colors hover:bg-danger-soft"
					>
						<X className="h-7 w-7" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => rate(true)}
						aria-label="Me gusta"
						className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent shadow-card transition-colors hover:bg-accent-soft"
					>
						<Heart className="h-7 w-7 fill-current" />
					</motion.button>
				</div>

				<p className="text-sm text-text-muted">
					Deslizá la tarjeta o usá los botones: derecha = me gusta, izquierda = no me
					gusta.
				</p>
			</div>
		</div>
	);
}
