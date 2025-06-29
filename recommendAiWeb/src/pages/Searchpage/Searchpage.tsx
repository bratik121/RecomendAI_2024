import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/common";
import { useInput } from "@/src/hooks";
import { postRate10MoviesProcess } from "@/src/redux/actions";
import { selectUser } from "@/src/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import { IRate_Movies, IReview } from "@/src/redux/Interfaces";
import {
	IPagination,
	useFetchMoviesByTitle,
} from "@/src/redux/hooks/useRateMovie";
import MovieCard from "./MovieCard";

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

	const review: IReview[] = [];
	const [pagination, setPagination] = useState<IPagination>({
		limit: 20,
		offset: 0,
	});

	const searchInput = useInput("");
	const dispatch = useDispatch();

	const { error, fetchMoviesByTitle, loading, movies, pages } =
		useFetchMoviesByTitle();

	const handleRateMovie = (id_movie: number) => {
		const data: IRate_Movies = {
			id_user: parseInt(id),
			movies: [
				{
					id_movie: id_movie,
					like: true,
				},
			],
		};
		dispatch(postRate10MoviesProcess(data));
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchMoviesByTitle({
				title: searchInput.value,
				pagination: pagination,
			});
		}, 500);
		// importante porque si vuelvo a escribir antes de que se cumpla el timeout, se cancela la búsqueda anterior
		return () => clearTimeout(timer);
	}, [searchInput.value, dispatch, id]);

	const handleNext = () => {
		setPagination({
			...pagination,
			offset: pagination.limit + pagination.offset,
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
			{loading ? (
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
							<MovieCard movie={movie} handleRateMovie={handleRateMovie} />
						))}
					</AnimatePresence>
				</motion.div>
			)}
			Pagina 1 de {pages}
		</div>
	);
};

export default Searchpage;
