import React from "react";
import { IMovie, IReview } from "@/src/redux/Interfaces";
import { FaHeart, FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import MovieCard from "./MovieCard";
import "./style.css";

type Props = {};

function ReviewFilms({}: Props) {
	const [ratedMovies, setRatedMovies] = React.useState<IReview[]>([]);
	const [index, setIndex] = React.useState<number>(0);
	const { movies } = useSelector((state: RootState) => state.movie);

	const handleDisLike = () => {
		const newRatedMovies = [
			...ratedMovies,
			{ movie_id: movies[index].id, liked: false },
		];
		setRatedMovies(newRatedMovies);
		setIndex(index + 1);
	};

	const handleLike = () => {
		const newRatedMovies = [
			...ratedMovies,
			{ movie_id: movies[index].id, liked: true },
		];
		setRatedMovies(newRatedMovies);
		setIndex(index + 1);
	};

	return (
		<div className="flex flex-col items-center mt-4 gap-y-4 relative z-40">
			{/* Titulo y subtitulo */}
			<div className="flex flex-col items-center gap-y-2">
				<h1 className="text-3xl font-bold font-custom ">Review Films</h1>
				<p className="text-center">
					Review ten films in order to get better recomendations
				</p>
			</div>
			{/* Clasificador de peliculas */}
			<div className=" flex flex-col gap-y-2 items-center">
				{/* Card de la pelicula */}
				<MovieCard
					title={movies[index].title}
					poster_path={movies[index].poster_path}
					genres={movies[index].genres}
					release_year={movies[index].release_year}
				/>
				{/* Buttons */}
				<div className="flex gap-x-2">
					<button
						className="rounded-full border border-red-600 p-3 hover:bg-red-400 transition duration-150"
						onClick={handleDisLike}
					>
						<FaTrash className="text-red-600 text-lg" />
					</button>
					<button
						className="rounded-full border border-primary-600 p-3 hover:bg-primary-400 transition duration-150"
						onClick={handleLike}
					>
						<FaHeart className="text-lg text-primary-600" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default ReviewFilms;
