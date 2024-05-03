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
		<div className="w-full flex flex-col gap-y-6 md:gap-y-2 items-center relative">
			<div className="aboutUs-blurredDot"></div>
			<h4 className="text-3xl md:text-5xl font-medium font-custom">About us</h4>
			<div className="flex gap-x-4 justify-around ">
				<Lottie
					animationData={about}
					loop={true}
					style={{ width: "300px", height: "300px" }}
					className="hidden md:block"
				/>
				<div className="text-center w-full  md:w-[60%] flex flex-col  gap-y-6  cursor-pointer  justify-center">
					<AnimatePresence mode="wait">
						<m.div
							className="flex flex-col gap-y-2 md:gap-y-1 "
							onClick={handleNext}
							variants={opacityVariant}
							initial="hidden"
							animate="visible"
							exit="hidden"
							key={selected}
						>
							{/* Titulo */}
							<h2 className="text-2xl md:text-3xl font-medium text-c_gray-900">
								{info[selected].title}
							</h2>
							{/* Parrafo */}
							<p className="md:text-lg text-c_gray-700">
								{info[selected].description}
							</p>
						</m.div>
					</AnimatePresence>
					{/* Botones */}
					<div className="flex justify-center gap-x-2">
						{info.map((_, index) => {
							return (
								<div
									key={index}
									onClick={() => handleSet(index)}
									className={`w-2 h-2 rounded-full cursor-pointer transition duration-150 ${
										selected === index ? "bg-primary-600" : "bg-c_gray-900"
									}`}
								></div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AboutSection;
