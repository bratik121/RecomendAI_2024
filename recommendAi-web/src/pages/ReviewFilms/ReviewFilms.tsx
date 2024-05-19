import React, { useEffect } from "react";
import { IReview } from "@/src/redux/Interfaces";
import { FaHeart, FaTrash } from "react-icons/fa";
import { Loading } from "@/src/components/common";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { IRate_10_Movies } from "@/src/redux/Interfaces";
import MovieCard from "./MovieCard";
import "./style.css";
import {
	post10MoviesProcess,
	postRate10MoviesProcess,
} from "@/src/redux/actions";

type Props = {};

function ReviewFilms({}: Props) {
	const [ratedMovies, setRatedMovies] = React.useState<IReview[]>([]);
	const dispatch = useDispatch();
	const [index, setIndex] = React.useState<number>(0);
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);
	const { movies, isFetching } = useSelector((state: RootState) => state.movie);

	//Trayendo 10 peliculas que el usuario no ha visto
	useEffect(() => {
		if (isAuthenticated) {
			console.log("Se ejecuto");
			dispatch(post10MoviesProcess(parseInt(user.id)));
		}
	}, [user.id]);

	useEffect(() => {
		if (ratedMovies.length > 0) {
			console.log(ratedMovies);
		}
	}, [ratedMovies]);

	const handleRate10Movies = () => {
		setRatedMovies([]);
		setIndex(0);
		const data: IRate_10_Movies = {
			id_user: parseInt(user.id),
			movies: ratedMovies,
		};
		console.log(data);
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

	if (isFetching) {
		return (
			<div className="flex py-8 justify-center items-center">
				<Loading />
			</div>
		);
	}

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
					vote_average={movies[index].vote_average}
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
