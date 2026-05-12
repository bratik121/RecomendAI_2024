import MovieSlide from "./MovieSlide";
import movies from "@/src/assets/movies/movies";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RipplesButton } from "@/src/components/common";
import "./style.css";
type Props = {};

const MovieSlider = (props: Props) => {
	return (
		<div className="flex flex-col items-center gap-y-10 w-full py-16">
			<h2 className="text-4xl md:text-5xl font-bold font-custom text-white tracking-tight">
				Trending <span className="text-primary-400">Now</span>
			</h2>
			{/* Slider */}
			<div className="w-full px-8 md:px-16 max-w-[1400px] mx-auto">
				<Splide
					hasTrack={false}
					options={{
						type: "loop",
						perPage: 5,
						perMove: 1,
						focus: "center",
						gap: "1.5rem",
						autoplay: true,
						pauseOnHover: true,
						interval: 4000,
						pagination: false,
						flickPower: 200,
						updateOnMove: true,
						breakpoints: {
							1024: {
								perPage: 3,
							},
							680: {
								perPage: 1,
								arrows: false,
							},
						},
					}}
				>
					<div className="splide__arrows">
						<button className="splide__arrow splide__arrow--prev !bg-c_dark_blue-400/80 hover:!bg-primary-500 !text-white transition-colors">
							<IoIosArrowForward className="text-2xl" />
						</button>
						<button className="splide__arrow splide__arrow--next !bg-c_dark_blue-400/80 hover:!bg-primary-500 !text-white transition-colors">
							<IoIosArrowForward className="text-2xl" />
						</button>
					</div>
					<SplideTrack>
						{movies.map((movie, index) => (
							<SplideSlide key={index} className="flex justify-center py-4">
								<MovieSlide img={movie.img} title={movie.title} />
							</SplideSlide>
						))}
					</SplideTrack>
				</Splide>
			</div>
		</div>
	);
};

export default MovieSlider;
