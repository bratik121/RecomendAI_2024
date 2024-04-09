import MovieSlide from "./MovieSlide";
import movies from "@/assets/movies/movies";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RipplesButton } from "@/components/common";
import "./style.css";
type Props = {};

const MovieSlider = (props: Props) => {
	return (
		<div className="flex flex-col items-center gap-y-2 w-full">
			{/* Slider */}
			<div className="w-full px-8 md:px-16">
				<Splide
					hasTrack={false}
					options={{
						type: "loop",
						perPage: 5,
						perMove: 1,
						focus: "center",
						gap: "0.25rem",
						autoplay: true,
						pauseOnHover: true,
						interval: 5000,
						pagination: false,
						flickPower: 200,
						updateOnMove: true,
						breakpoints: {
							680: {
								perPage: 1,
								arrows: false,
							},
						},
					}}
				>
					<div className="splide__arrows">
						<button className="splide__arrow splide__arrow--prev">
							<IoIosArrowForward className="text-2xl" />
						</button>
						<button className="splide__arrow splide__arrow--next">
							<IoIosArrowForward className="text-2xl" />
						</button>
					</div>
					<SplideTrack>
						{movies.map((movie, index) => (
							<SplideSlide key={index} className="flex justify-center ">
								<MovieSlide img={movie.img} title={movie.title} />
							</SplideSlide>
						))}
					</SplideTrack>
				</Splide>
			</div>
			<div className="md:translate-x-3">
				<RipplesButton
					handleClick={() => console.log("clicked")}
					text="know more"
				/>
			</div>
		</div>
	);
};

export default MovieSlider;
