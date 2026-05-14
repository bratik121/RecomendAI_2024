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
			<div className="flex flex-col min-h-[60vh] justify-center items-center gap-y-6 text-center max-w-2xl mx-auto px-4 py-20">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
					className="w-28 h-28 bg-primary-500/10 rounded-full flex items-center justify-center mb-4 border border-primary-500/30 shadow-[0_0_30px_rgba(9,217,158,0.2)]"
				>
					<FaHeart className="text-6xl text-primary-500" />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
				>
					<h2 className="text-4xl md:text-5xl font-bold font-custom text-white tracking-tight mb-4">Awesome Job!</h2>
					<p className="text-xl text-c_gray-500 leading-relaxed mb-8">
						Your ratings have been saved. Our AI is analyzing your taste to find your next favorite movies.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Button text="Discover Movies" onClick={() => navigate("/search")} />
						<Button text="Rate More" fill={false} onClick={() => {
							setIsBatchComplete(false);
							setRatedMovies([]);
							setIndex(0);
						}} />
					</div>
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
