import { useState } from "react";
import { AnimatePresence, motion as m } from "framer-motion";
import { opacityVariant } from "@/src/types";
import about from "@/src/assets/lottie/about.json";
import Lottie from "lottie-react";
import "./style.css";

type info = {
	title: string;
	description: string;
};

const info: info[] = [
	{
		title: "Our Mission",
		description:
			"At What2Watch, our mission is to transform movie watching into a truly personalized experience. We leverage cutting-edge AI technology to curate movie recommendations that resonate with your unique tastes and preferences, ensuring your next movie night is always a hit 🚀.",
	},
	{
		title: "Who We Are",
		description:
			"We are a team of movie enthusiasts and tech innovators united by one goal: to revolutionize the way people discover and enjoy films. We combine expertise in data science, user experience, and the entertainment industry to bring you the best of cinema from around the world 🌎.",
	},
	{
		title: "Join Us",
		description:
			"Become part of the What2Watch community today and start enjoying a more personalized movie discovery experience. Sign up for free, rate your watched movies, and let us guide you to your next favorite film 🎞️.",
	},
];

const AboutSection = () => {
	const [selected, setSelected] = useState(0);

	const handleNext = () => {
		if (selected < info.length - 1) {
			setSelected(selected + 1);
		} else {
			setSelected(0);
		}
	};

	const handleSet = (index: number) => {
		setSelected(index);
	};

	return (
		<div className="max-w-7xl mx-auto w-full flex flex-col gap-y-12 items-center relative py-16">
			<h2 className="text-4xl md:text-5xl font-bold font-custom text-white tracking-tight">
				How <span className="text-primary-400">RecomendAI</span> Works
			</h2>
			
			<div className="flex flex-col md:flex-row gap-8 lg:gap-16 justify-center items-center w-full bg-c_dark_blue-600/30 rounded-3xl p-8 lg:p-12 border border-white/5 shadow-xl backdrop-blur-sm">
				<div className="w-full md:w-1/2 flex justify-center">
					<Lottie
						animationData={about}
						loop={true}
						className="w-[250px] md:w-[350px] lg:w-[450px]"
					/>
				</div>
				
				<div className="w-full md:w-1/2 flex flex-col gap-y-8 justify-center">
					<AnimatePresence mode="wait">
						<m.div
							className="flex flex-col gap-y-4 min-h-[200px]"
							onClick={handleNext}
							variants={opacityVariant}
							initial="hidden"
							animate="visible"
							exit="hidden"
							key={selected}
						>
							<h3 className="text-3xl lg:text-4xl font-bold text-white">
								{info[selected].title}
							</h3>
							<p className="text-lg lg:text-xl text-c_gray-500 leading-relaxed font-medium">
								{info[selected].description}
							</p>
						</m.div>
					</AnimatePresence>
					
					{/* Navigation Dots */}
					<div className="flex items-center gap-x-3 mt-4">
						{info.map((_, index) => (
							<button
								key={index}
								onClick={() => handleSet(index)}
								aria-label={`Go to slide ${index + 1}`}
								className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
									selected === index 
										? "w-8 bg-primary-500 shadow-[0_0_10px_rgba(9,217,158,0.5)]" 
										: "w-2 bg-c_gray-700 hover:bg-c_gray-500"
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AboutSection;
