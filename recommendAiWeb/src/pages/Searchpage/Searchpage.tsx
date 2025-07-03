import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/common";
import { useInput } from "@/src/hooks";
import {
	HiChevronDoubleLeft,
	HiChevronDoubleRight,
	HiChevronLeft,
	HiChevronRight,
} from "react-icons/hi";
import { selectUser } from "@/src/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import { IReview } from "@/src/redux/Interfaces";
import {
	IPagination,
	useFetchMoviesByTitle,
} from "@/src/redux/hooks/useFetchMovieByTitle";
import MovieCard from "./MovieCard";
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
	const dispatch = useDispatch();

	const {
		error: fetchMoviesError,
		fetchMoviesByTitle,
		loading: fetchMoviesLoading,
		movies,
		pages,
	} = useFetchMoviesByTitle();

	const { error, loading, rateMovie } = useRateMovie();

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
		const timer = setTimeout(fetchMovies, 500);
		// importante porque si vuelvo a escribir antes de que se cumpla el timeout, se cancela la búsqueda anterior
		return () => clearTimeout(timer);
	}, [searchInput.value, id]);

	const handleNext = () => {
		setPagination({
			...pagination,
			offset: pagination.limit + pagination.offset,
		});
	};

	const handlePrev = () => {
		setPagination({
			...pagination,
			offset: pagination.offset - pagination.limit,
		});
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
			<div className="mb-10">
				<motion.h1
					className="text-3xl font-bold text-primary-400 mb-2"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					Buscar Películas
				</motion.h1>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<Input
						value={searchInput.value}
						onChange={searchInput.onChange}
						onFocus={searchInput.onFocus}
						placeholder="Escribe el título de una película..."
					/>
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
			<div className=" flex  items-center">
				<div>
					<HiChevronLeft />
				</div>
				<div> Pagina 1 de {pages}</div>
				<div>
					<HiChevronRight />
				</div>
			</div>
		</div>
	);
};

export default Searchpage;
