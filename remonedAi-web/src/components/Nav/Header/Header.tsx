import React, { useState, useEffect } from "react";
import logo from "@/src/assets/logo-removebg-preview.png";
import { useScroll, useTransform } from "framer-motion";
import "./style.css";

const Header = () => {
	const { scrollYProgress } = useScroll();
	const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

	// State to hold the current opacity value
	const [currentOpacity, setCurrentOpacity] = useState(1); // default initial opacity

	// Update the opacity state whenever the `opacity` MotionValue changes
	useEffect(() => {
		const unsubscribe = opacity.onChange((latestOpacity) => {
			setCurrentOpacity(latestOpacity);
		});

		// Cleanup function to unsubscribe from changes when the component unmounts
		return () => unsubscribe();
	}, [opacity]);

	return (
		<header className="hidden lg:block h-[72px] w-full fixed z-50">
			<div className=" top-0 left-0 flex items-center justify-between px-8 h-full w-full absolute z-40  ">
				<div className="flex items-center gap-x-2 cursor-pointer w-fit ">
					<h2 className="text-white font-custom font-semibold">What2Watch</h2>
					<div className="h-12 aspect-square">
						<img src={logo} alt="What2Watch Logo" />
					</div>
				</div>
			</div>
			<div
				className=" absolute top-0 w-full h-full z-30 bg-c_dark_blue-600 right-0"
				style={{ opacity: currentOpacity }}
			></div>
		</header>
	);
};

export default Header;
