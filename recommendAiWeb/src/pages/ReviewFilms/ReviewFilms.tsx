import { useEffect, useState } from "react";
import { IReview } from "@/src/redux/Interfaces";
import { FaHeart, FaTimes } from "react-icons/fa";
import { Loading, Button } from "@/src/components/common";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { IRate_Movies } from "@/src/redux/Interfaces";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
	post10MoviesProcess,
	postRate10MoviesProcess,
} from "@/src/redux/actions";
import SwipeMovieCard from "./SwipeMovieCard";
import MovieCard from "@/src/components/MovieCard/MovieCard";
function ReviewFilms() {
	const [ratedMovies, setRatedMovies] = useState<IReview[]>([]);
	const [isBatchComplete, setIsBatchComplete] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [index, setIndex] = useState<number>(0);
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);
	const { movies, isFetching } = useSelector((state: RootState) => state.movie);

  useEffect(() => {
    console.log(movies);
  }, [movies]);

	useEffect(() => {
    console.log(isAuthenticated);
    console.log(user?.id);
    console.log(isBatchComplete);
    console.log(movies.length); 

    if (isAuthenticated && user?.id && !isBatchComplete && movies.length === 0) {
      console.log("Trayendo 10 nuevas peliculas")
			dispatch(post10MoviesProcess(parseInt(user.id)));
		}
	}, [user.id, isAuthenticated, dispatch]);

	const submitBatch = (finalRatedMovies: IReview[]) => {
		setIsBatchComplete(true);
		const data: IRate_Movies = {
			id_user: parseInt(user.id),
			reviews: finalRatedMovies,
		};
		dispatch(postRate10MoviesProcess(data));
	};

	const handleDisLike = () => {
		const newRatedMovies = [
			...ratedMovies,
			{ id_movie: movies[index].id, like: false },
		];
		
		if (index === movies.length - 1) {
			submitBatch(newRatedMovies);
		} else {
			setRatedMovies(newRatedMovies);
			setIndex(index + 1);
		}
	};


	const handleLike = () => {
		const newRatedMovies = [
			...ratedMovies,
			{ id_movie: movies[index].id, like: true },
		];
		
		if (index === movies.length - 1) {
			submitBatch(newRatedMovies);
		} else {
			setRatedMovies(newRatedMovies);
			setIndex(index + 1);
		}
	};


	if (isFetching || !movies || movies.length === 0) {
		return (
			<div className="flex min-h-[60vh] justify-center items-center">
				<Loading />
			</div>
		);
	}

if (isBatchComplete) {
	return (
		<div className="relative z-40 mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center px-4 py-16 text-center">
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ type: "spring", bounce: 0.35, duration: 0.8 }}
				className="mb-10 flex max-w-3xl flex-col items-center"
			>
				<div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 shadow-[0_0_40px_rgba(9,217,158,0.22)]">
					<FaHeart className="text-6xl text-primary-500" />
				</div>

				<h2 className="mb-4 font-custom text-4xl font-bold tracking-tight text-white md:text-5xl">
					Your recommendations are ready
				</h2>

				<p className="mb-4 max-w-2xl text-lg leading-relaxed text-c_gray-500 md:text-xl">
					Based on your latest ratings, RecomendAI has selected a fresh set of movies that better match your taste.
				</p>

				<p className="max-w-2xl rounded-2xl border border-primary-500/20 bg-primary-500/10 px-5 py-4 text-sm leading-relaxed text-c_gray-300 md:text-base">
					If these options still don&apos;t convince you, rate another batch to receive 10 fresh recommendations.
				</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15, duration: 0.5 }}
				className="mb-10 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
			>
				{movies.slice(0, 10).map((movie, movieIndex) => (
					<motion.article
						key={movie.id}
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: movieIndex * 0.04,
							duration: 0.35,
						}}
						whileHover={{ y: -8, scale: 1.02 }}
					>
            <MovieCard movie={movie} />
					</motion.article>
				))}
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.35, duration: 0.4 }}
				className="flex flex-col items-center justify-center gap-4 sm:flex-row"
			>
				<Button text="Discover Movies" onClick={() => navigate("/search")} />

				<Button
					text="Rate Another Batch"
					fill={false}
					onClick={() => {
						setIsBatchComplete(false);
						setRatedMovies([]);
						setIndex(0);

						if (user?.id) {
							dispatch(post10MoviesProcess(parseInt(user.id)));
						}
					}}
				/>
			</motion.div>
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
				<div className="h-2 w-full bg-c_dark_blue-400 rounded-full overflow-hidden border border-white/5">
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
            <SwipeMovieCard
              key={movies[index].id}
              movie={movies[index]}
              onLike={handleLike}
              onDislike={handleDisLike}
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
