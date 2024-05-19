import { MovieSlider } from "./MovieSlider";
import { AboutSection } from "./AboutSection";
import { Hero } from "./Hero";

const Landingpage = () => {
	return (
		<div className="w-full max-w-full items-center flex flex-col gap-y-12 px-8 py-4 relative   overflow-x-hidden">
			<Hero />
			<AboutSection />
			<MovieSlider />
		</div>
	);
};

export default Landingpage;
