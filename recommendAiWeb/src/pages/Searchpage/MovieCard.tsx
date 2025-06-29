import { IMovie } from "@/src/redux/Interfaces";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FaHeart, FaStar } from "react-icons/fa";

type Props = {
	movie: IMovie;
	handleRateMovie: (id_movie: number) => void;
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

const MovieCard = ({ movie, handleRateMovie }: Props) => {
	const [hoveredMovie, setHoveredMovie] = useState<number | null>(null);
	return (
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
	);
};

export default MovieCard;
