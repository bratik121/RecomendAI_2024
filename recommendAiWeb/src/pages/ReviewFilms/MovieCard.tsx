import { TiStarFullOutline } from "react-icons/ti";

type Props = {
	poster_path: string;
	title: string;
	genres: string[];
	release_year: string;
	vote_average: number;
};

const MovieCard = ({
	genres,
	poster_path,
	release_year,
	title,
	vote_average,
}: Props) => {
	return (
		<div className="movie-glass flex flex-col gap-y-2 p-4">
			<div className="h-[300px]">
				<img
					src={`https://image.tmdb.org/t/p/w500/${poster_path} `}
					alt={title}
					className="h-full w-full object-scale-down rounded-lg"
				/>
			</div>
			<div className="flex flex-col">
				<div className=" flex  gap-x-2">
					<span>{title}</span>
					<div className="flex gap-x-1 items-center">
						<span>{parseFloat((vote_average * 10).toFixed(2))}</span>
						<TiStarFullOutline className="text-yellow-400" />
					</div>
				</div>
				<span className="italic">{genres?.join(", ")}.</span>
				<span>{release_year}</span>
			</div>
		</div>
	);
};

export default MovieCard;
