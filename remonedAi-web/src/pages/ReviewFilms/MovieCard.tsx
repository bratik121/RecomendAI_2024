import React from "react";

type Props = {
	poster_path: string;
	title: string;
	genres: string[];
	release_year: string;
};

const MovieCard = ({ genres, poster_path, release_year, title }: Props) => {
	return (
		<div className="movie-glass flex flex-col gap-y-2 p-4">
			<div className="h-[300px]">
				<img
					src={`https://image.tmdb.org/t/p/w500/${poster_path} `}
					alt=""
					className="h-full w-full object-scale-down rounded-lg"
				/>
			</div>
			<div className="flex flex-col">
				<span>{title}</span>
				<span className="italic">{genres?.join(", ")}.</span>
				<span>{release_year}</span>
			</div>
		</div>
	);
};

export default MovieCard;
