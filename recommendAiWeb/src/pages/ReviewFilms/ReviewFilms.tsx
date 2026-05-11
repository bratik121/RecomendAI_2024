import { useEffect, useState } from "react";
import { IReview } from "@/src/redux/Interfaces";
import { FaHeart, FaTimes } from "react-icons/fa";
import { Loading } from "@/src/components/common";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { IRate_Movies } from "@/src/redux/Interfaces";
import MovieCard from "./MovieCard";
import { AnimatePresence, motion } from "framer-motion";
import {
	post10MoviesProcess,
	postRate10MoviesProcess,
} from "@/src/redux/actions";

type Props = {};

function ReviewFilms({}: Props) {
	const [ratedMovies, setRatedMovies] = useState<IReview[]>([]);
	const dispatch = useDispatch();
	const [index, setIndex] = useState<number>(0);
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);
	const { movies, isFetching } = useSelector((state: RootState) => state.movie);

	//Trayendo 10 peliculas que el usuario no ha visto
	useEffect(() => {
		if (isAuthenticated && user?.id) {
			dispatch(post10MoviesProcess(parseInt(user.id)));
		}
	}, [user.id, isAuthenticated, dispatch]);

	const handleRate10Movies = () => {
		setRatedMovies([]);
		setIndex(0);
		const data: IRate_Movies = {
			id_user: parseInt(user.id),
			reviews: ratedMovies,
		};
		dispatch(postRate10MoviesProcess(data));
	};

	const handleDisLike = () => {
		if (index === movies.length - 1) {
			handleRate10Movies();
			return;
		}
		const newRatedMovies = [
			...ratedMovies,
			{ id_movie: movies[index].id, like: false },
		];
		setRatedMovies(newRatedMovies);
		setIndex(index + 1);
	};

	const handleLike = () => {
		if (index === movies.length - 1) {
			handleRate10Movies();
			return;
		}
		const newRatedMovies = [
			...ratedMovies,
			{ id_movie: movies[index].id, like: true },
		];
		setRatedMovies(newRatedMovies);
		setIndex(index + 1);
	};

	if (isFetching || !movies || movies.length === 0) {
		return (
			<div className="flex min-h-[60vh] justify-center items-center">
				<Loading />
			</div>
		);
	}

	const progressPercentage = ((index + 1) / movies.length) * 100;

	return (
		<div className="flex flex-col items-center mt-4 gap-y-6 relative z-40 max-w-4xl mx-auto px-4 pb-12">
			{/* Titulo y subtitulo */}
			<div className="flex flex-col items-center gap-y-2 mt-4">
				<h1 className="text-4xl font-bold font-custom text-primary-400 tracking-tight">Review Films</h1>
				<p className="text-center text-c_gray-500 max-w-md">
					Review ten films in order to get better personalized recommendations
				</p>
			</div>

			{/* Progress Bar */}
			<div className="w-full max-w-sm mt-2">
				<div className="flex justify-between text-sm text-c_gray-700 mb-2 font-medium">
					<span>Progress</span>
					<span>{index + 1} / {movies.length}</span>
				</div>
				<div className="h-2 w-full bg-c_dark_blue-400 rounded-full overflow-hidden">
					<motion.div 
						initial={{ width: 0 }}
						animate={{ width: `${progressPercentage}%` }}
						transition={{ duration: 0.3 }}
						className="h-full bg-primary-500 rounded-full"
					/>
				</div>
			</div>

			{/* Clasificador de peliculas */}
			<div className="flex flex-col gap-y-8 items-center w-full mt-4">
				{/* Card de la pelicula */}
				<div className="w-full min-h-[500px] flex justify-center items-center">
					<AnimatePresence mode="wait">
						{movies[index] && (
							<MovieCard
								key={movies[index].id}
								title={movies[index].title}
								poster_path={movies[index].poster_path}
								genres={movies[index].genres}
								release_year={movies[index].release_year}
								vote_average={movies[index].vote_average}
							/>
						)}
					</AnimatePresence>
				</div>
				
				{/* Buttons */}
				<div className="flex gap-x-6">
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className="flex items-center justify-center w-16 h-16 rounded-full bg-c_dark_blue-400 border border-red-500/50 shadow-lg hover:bg-red-500/10 hover:border-red-500 transition-colors duration-200"
						onClick={handleDisLike}
						title="Dislike"
					>
						<FaTimes className="text-red-500 text-2xl" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className="flex items-center justify-center w-16 h-16 rounded-full bg-c_dark_blue-400 border border-primary-500/50 shadow-lg hover:bg-primary-500/10 hover:border-primary-500 transition-colors duration-200"
						onClick={handleLike}
						title="Like"
					>
						<FaHeart className="text-2xl text-primary-500" />
					</motion.button>
				</div>
			</div>
		</div>
	);
}

export default ReviewFilms;
