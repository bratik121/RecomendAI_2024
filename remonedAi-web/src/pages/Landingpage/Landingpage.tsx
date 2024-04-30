import React from "react";
import logo from "@/src/assets/logo-removebg-preview.png";
import { MovieSlider } from "./MovieSlider";
import { AboutSection } from "./AboutSection";
import { Hero } from "./Hero";
type Props = {};

const OldHero = () => {
	return (
		<div className="flex flex-col gap-y-2  md:gap-y-0  w-full items-center ">
			<div className="flex flex-col md:flex-row items-center w-full justify-center relative">
				<h2 className="text-white font-custom font-semibold text-4xl md:text-6xl order-2 md:order-1">
					What2Watch
				</h2>
				<div className="h-28 aspect-square order-1 md:order-2">
					<img src={logo} alt="" />
				</div>
			</div>
			<span className="md:text-lg text-primary-600 italic font-medium text-center">
				"From Bored to Buzzed: Your Next Movie Awaits"
			</span>
		</div>
	);
};

const Landingpage = (props: Props) => {
	return (
		<div className="w-full items-center flex flex-col gap-y-12  px-8 py-4  ">
			<Hero />
			{/* MovieSlider */}
			{/* AboutSection */}
			<AboutSection />
			<MovieSlider />
		</div>
	);
};

export default Landingpage;
