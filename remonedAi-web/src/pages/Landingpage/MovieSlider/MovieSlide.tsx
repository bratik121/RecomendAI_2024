import React from "react";
import "index.css";
type Props = {
	img: string;
	title: string;
};

const MovieSlide = ({ img, title }: Props) => {
	return (
		<div className="flex flex-col gap-y-1 w-fit h-fit movie_slide ">
			<div className="h-[280px] w-[200px] rounded-lg overflow-hidden ">
				<img src={img} alt={title} className="h-full w-full" />
			</div>
			<div className="text-center italic">{title}</div>
		</div>
	);
};

export default MovieSlide;
