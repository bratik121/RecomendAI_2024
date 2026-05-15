import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/common";
import { useInput } from "@/src/hooks";
import {
	HiChevronLeft,
	HiChevronRight,
} from "react-icons/hi";
import { selectUser } from "@/src/redux/selectors";
import { useSelector } from "react-redux";
import { IReview } from "@/src/redux/Interfaces";
import {
	IPagination,
	useFetchMoviesByTitle,
} from "@/src/redux/hooks/useFetchMovieByTitle";
import MovieCard from "../../components/MovieCard/MovieCard";
import { useRateMovie } from "@/src/redux/hooks/useRateMovie";

// Variantes de animación
const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const Searchpage = () => {
	const { id } = useSelector(selectUser);

	const [pagination, setPagination] = useState<IPagination>({
		limit: 20,
		offset: 0,
	});

	const searchInput = useInput("");

	const {
		fetchMoviesByTitle,
		loading: fetchMoviesLoading,
		movies,
		pages,
	} = useFetchMoviesByTitle();

	const actualPage = (pagination.offset + 20) / 20;
	const hasNextPage = actualPage < pages!;
	const hasPrexPage = actualPage > 0;

	const { loading, rateMovie } = useRateMovie();

	const fetchMovies = () => {
		if (searchInput.value) {
			fetchMoviesByTitle({
				title: searchInput.value,
				pagination: pagination,
			});
		}
	};

	const handleRateMovie = (id_movie: number) => {
		const review: IReview = {
			id_movie: id_movie,
			like: true,
		};
		rateMovie(review, fetchMovies);
	};

	useEffect(() => {
		if (pagination.offset) {
			setPagination({
				...pagination,
				offset: 0,
			});
		}

		const timer = setTimeout(fetchMovies, 500);
		// importante porque si vuelvo a escribir antes de que se cumpla el timeout, se cancela la búsqueda anterior
		return () => clearTimeout(timer);
	}, [searchInput.value, id]);

	const handleNext = () => {
		if (hasNextPage) {
			const newOffset = pagination.limit + pagination.offset;
			console.log("pages / offtset", pages! / newOffset);
			setPagination({
				...pagination,
				offset: newOffset,
			});
		}
	};

	const handlePrev = () => {
		setPagination({
			...pagination,
			offset: pagination.offset - pagination.limit,
		});
	};

	useEffect(() => {
		fetchMovies();
	}, [pagination.offset]);

	return (
		<div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
			<div className="mb-16 flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center mb-8"
				>
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-custom text-white tracking-tight mb-4">
						Discover Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Obsession</span>
					</h1>
					<p className="text-lg text-c_gray-500 font-medium max-w-2xl mx-auto">
						Search through thousands of movies, rate your favorites, and let our AI curate the perfect watchlist just for you.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="w-full max-w-3xl"
				>
					<div className="relative shadow-2xl rounded-xl">
						<Input
							value={searchInput.value}
							onChange={searchInput.onChange}
							onFocus={searchInput.onFocus}
							placeholder="Search for a movie title..."
						/>
					</div>
				</motion.div>
			</div>
			{fetchMoviesLoading || loading ? (
				<div className="flex justify-center py-20">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
					></motion.div>
				</div>
			) : movies.length === 0 ? (
				<motion.div
					className="text-center py-20"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<div className="text-5xl mb-4 text-primary-500">🍿</div>
					<h3 className="text-2xl font-medium text-c_gray-500">
						{searchInput.value
							? "No encontramos películas"
							: "Busca tus películas favoritas"}
					</h3>
					<p className="text-c_gray-700 mt-2">
						{searchInput.value
							? "Intenta con otro nombre"
							: "Comienza escribiendo en el buscador"}
					</p>
				</motion.div>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
				>
					<AnimatePresence>
						{movies.map((movie) => (
							<MovieCard
								movie={movie}
								handleRateMovie={handleRateMovie}
								key={movie.id}
							/>
						))}
					</AnimatePresence>
				</motion.div>
			)}
			{movies.length > 0 && !fetchMoviesLoading && !loading && (
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-x-4 mt-12 mb-8"
				>
					<button
						onClick={handlePrev}
						disabled={!hasPrexPage}
						className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-c_dark_blue-400 border border-c_dark_blue-400 hover:border-primary-500 disabled:opacity-50 disabled:hover:border-c_dark_blue-400 disabled:cursor-not-allowed transition-colors text-white font-medium shadow-md"
					>
						<HiChevronLeft className="text-xl" /> Anterior
					</button>
					<div className="text-c_gray-200 font-medium bg-c_dark_blue-600 border border-c_dark_blue-400 shadow-inner px-4 py-2 rounded-lg">
						Página <span className="text-primary-400 font-bold">{actualPage}</span> de {pages || 1}
					</div>
					<button
						onClick={handleNext}
						disabled={!hasNextPage}
						className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-c_dark_blue-400 border border-c_dark_blue-400 hover:border-primary-500 disabled:opacity-50 disabled:hover:border-c_dark_blue-400 disabled:cursor-not-allowed transition-colors text-white font-medium shadow-md"
					>
						Siguiente <HiChevronRight className="text-xl" />
					</button>
				</motion.div>
			)}
		</div>
	);
};

export default Searchpage;
