import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

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
		<motion.div 
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95, x: 20 }}
			transition={{ duration: 0.3 }}
			className="bg-c_dark_blue-400 rounded-2xl overflow-hidden relative border border-c_dark_blue-400 shadow-2xl w-full max-w-sm mx-auto"
		>
			<div className="relative h-[480px] w-full">
				<img
					src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : "/placeholder-movie.jpg"}
					alt={title}
					className="h-full w-full object-cover"
				/>
				{/* Gradient overlay for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-t from-c_black via-c_black/50 to-transparent"></div>
				
				{/* Year Badge */}
				<div className="absolute top-4 right-4 bg-primary-500 text-c_black text-sm font-bold px-3 py-1 rounded-md shadow-lg">
					{release_year}
				</div>

				{/* Info at bottom of image */}
				<div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-y-2">
					<h2 className="text-2xl font-bold text-white line-clamp-2 leading-tight">
						{title}
					</h2>
					
					<div className="flex items-center gap-x-2">
						<FaStar className="w-5 h-5 text-yellow-500" />
						<span className="text-xl font-bold text-white">
							{parseFloat((vote_average * 10).toFixed(2))}
						</span>
						<span className="text-c_gray-500 text-sm">/10</span>
					</div>

					<div className="flex flex-wrap gap-2 mt-2">
						{genres?.slice(0, 3).map((genre) => (
							<span
								key={genre}
								className="bg-primary-900/80 backdrop-blur-sm border border-primary-800 text-primary-100 text-xs px-3 py-1 rounded-full font-medium"
							>
								{genre}
							</span>
						))}
						{genres && genres.length > 3 && (
							<span className="bg-c_dark_blue-600/80 backdrop-blur-sm border border-c_dark_blue-400 text-c_gray-200 text-xs px-3 py-1 rounded-full font-medium">
								+{genres.length - 3}
							</span>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default MovieCard;
