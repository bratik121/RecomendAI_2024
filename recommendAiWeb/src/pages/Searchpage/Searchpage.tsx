import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Film, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useInput } from "@/src/hooks";
import { selectUser } from "@/src/redux/selectors";
import { IReview } from "@/src/redux/Interfaces";
import {
	IPagination,
	useFetchMoviesByTitle,
} from "@/src/redux/hooks/useFetchMovieByTitle";
import { useRateMovie } from "@/src/redux/hooks/useRateMovie";
import { MovieCard } from "@/src/components/MovieCard";
import { EmptyState } from "@/src/components/EmptyState";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { fadeDown, staggerContainer } from "@/src/lib/motion";

export function Searchpage() {
	const { id } = useSelector(selectUser);

	const [pagination, setPagination] = useState<IPagination>({ limit: 20, offset: 0 });
	const searchInput = useInput("");

	const { fetchMoviesByTitle, loading: fetchMoviesLoading, movies, pages } =
		useFetchMoviesByTitle();
	const { loading: rateLoading, rateMovie } = useRateMovie();

	const loading = fetchMoviesLoading || rateLoading;
	const actualPage = pagination.offset / pagination.limit + 1;
	const hasNextPage = actualPage < (pages ?? 1);
	const hasPrevPage = actualPage > 1;

	const fetchMovies = () => {
		if (searchInput.value) {
			fetchMoviesByTitle({
				title: searchInput.value,
				pagination,
			});
		}
	};

	const handleRateMovie = (id_movie: number) => {
		const review: IReview = { id_movie, like: true };
		rateMovie(review, fetchMovies);
	};

	useEffect(() => {
		if (pagination.offset) setPagination({ ...pagination, offset: 0 });
		const timer = setTimeout(fetchMovies, 500);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput.value, id]);

	useEffect(() => {
		fetchMovies();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagination.offset]);

	const goTo = (offset: number) => setPagination((p) => ({ ...p, offset }));

	return (
		<div className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6">
			<motion.div
				variants={fadeDown}
				initial="hidden"
				animate="visible"
				className="mb-10 flex flex-col items-center text-center"
			>
				<h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
					Descubrí tu próxima{" "}
					<span className="text-accent">obsesión</span>
				</h1>
				<p className="mt-3 max-w-2xl text-text-secondary">
					Buscá entre miles de películas, calificá tus favoritas y dejá que la IA
					arme tu próxima maratón.
				</p>
			</motion.div>

			<motion.div
				variants={fadeDown}
				initial="hidden"
				animate="visible"
				className="mx-auto mb-12 w-full max-w-2xl"
			>
				<div className="relative">
					<SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
					<Input
						value={searchInput.value}
						onChange={searchInput.onChange}
						onFocus={searchInput.onFocus}
						placeholder="Buscar una película..."
						aria-label="Buscar película"
						className="h-12 pl-10 text-base"
					/>
				</div>
			</motion.div>

			{loading ? (
				<div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
					{Array.from({ length: 10 }).map((_, index) => (
						<Skeleton key={index} className="aspect-[2/3] w-full rounded-2xl" />
					))}
				</div>
			) : movies.length === 0 ? (
				<EmptyState
					icon={<Film className="h-7 w-7" />}
					title={
						searchInput.value
							? "No encontramos películas"
							: "Busca tus películas favoritas"
					}
					description={
						searchInput.value
							? "Probá con otro nombre."
							: "Empezá escribiendo en el buscador."
					}
				/>
			) : (
				<>
					<motion.div
						variants={staggerContainer(0.05)}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
					>
						{movies.map((movie) => (
							<MovieCard
								key={movie.id}
								movie={movie}
								onLike={handleRateMovie}
							/>
						))}
					</motion.div>

					<div className="mt-12 flex items-center justify-center gap-3">
						<Button
							variant="outline"
							onClick={() => goTo(pagination.offset - pagination.limit)}
							disabled={!hasPrevPage}
						>
							<ChevronLeft className="h-4 w-4" />
							Anterior
						</Button>
						<span className="px-3 text-sm font-medium text-text-secondary">
							Página <span className="font-bold text-text-primary">{actualPage}</span>{" "}
							de {pages || 1}
						</span>
						<Button
							variant="outline"
							onClick={() => goTo(pagination.offset + pagination.limit)}
							disabled={!hasNextPage}
						>
							Siguiente
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
