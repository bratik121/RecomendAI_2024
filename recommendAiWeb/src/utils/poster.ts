export const getPosterUrl = (
	posterPath?: string,
	size: "w342" | "w500" | "w780" | "original" = "w500"
) => {
	if (!posterPath) return "/placeholder-movie.jpg";

	if (posterPath.startsWith("http")) {
		return posterPath;
	}

	return `https://image.tmdb.org/t/p/${size}/${posterPath}`;
};
