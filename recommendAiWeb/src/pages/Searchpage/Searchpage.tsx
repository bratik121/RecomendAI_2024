import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/src/components/common";
import { useInput } from "@/src/hooks";
import {
	postRate10MoviesProcess,
	searchMoviesByNameProcess,
} from "@/src/redux/actions";
import { selectUser } from "@/src/redux/selectors";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaStar } from "react-icons/fa";
import { IRate_Movies, IReview } from "@/src/redux/Interfaces";
import {
	IPagination,
	useFetchMoviesByTitle,
} from "@/src/redux/hooks/useRateMovie";

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

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
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
	const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
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
							<motion.div
								key={movie.id}
								variants={itemVariants}
								whileHover="hover"
								className="bg-c_dark_blue-400 rounded-xl overflow-hidden relative border border-c_dark_blue-400"
								onMouseEnter={() => setHoveredMovie(movie.id)}
								onMouseLeave={() => setHoveredMovie(null)}
							>
								{/* Poster con overlay de información */}
								<div className="relative">
									<img
										src={
											movie.poster_path
												? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
												: "/placeholder-movie.jpg"
										}
										alt={movie.title}
										className="w-full h-72 object-cover"
									/>

									{/* Overlay hover */}
									<AnimatePresence>
										{hoveredMovie === movie.id && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="absolute inset-0 bg-c_black bg-opacity-90 flex items-center justify-center p-4"
											>
												<p className="text-c_gray-200 text-sm line-clamp-6">
													{movie.overview || "Descripción no disponible"}
												</p>
											</motion.div>
										)}
									</AnimatePresence>

									{/* Badge de año */}
									<div className="absolute top-3 right-3 bg-primary-500 text-c_black text-xs font-bold px-2 py-1 rounded-md">
										{movie.release_year}
									</div>

									{/* Botón de favorito */}
									<motion.button
										className="absolute top-3 left-3 p-2 bg-c_dark_blue-600 bg-opacity-80 rounded-full hover:bg-primary-500 hover:text-c_black transition"
										whileTap={{ scale: 0.9 }}
										onClick={() => {
											handleRateMovie(movie.id);
										}}
									>
										<FaHeart
											className={`w-5 h-5 ${
												movie.liked ? "text-primary-400" : "text-c_gray-500"
											}`}
										/>
									</motion.button>
								</div>

								{/* Información de la película */}
								<div className="p-4">
									<div className="flex justify-between items-start mb-2">
										<h3 className="font-bold text-c_gray-200 line-clamp-2 text-lg">
											{movie.title}
										</h3>
									</div>

									<div className="flex items-center mb-3">
										<FaStar className="w-5 h-5 text-yellow-500 mr-1" />
										<span className="font-bold text-c_gray-200">
											{parseFloat((movie.vote_average * 10).toFixed(2))}
										</span>
										<span className="text-c_gray-500 text-sm ml-1">/10</span>
									</div>

									<div className="flex flex-wrap gap-1">
										{movie.genres.slice(0, 3).map((genre) => (
											<span
												key={genre}
												className="bg-primary-900 text-primary-100 text-xs px-2 py-1 rounded-full"
											>
												{genre}
											</span>
										))}
										{movie.genres.length > 3 && (
											<span className="bg-c_dark_blue-400 text-c_gray-200 text-xs px-2 py-1 rounded-full">
												+{movie.genres.length - 3}
											</span>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			)}
			Pagina 1 de {pages}
		</div>
	);
};

export default Searchpage;
