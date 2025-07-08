import React from "react";
import videoTrhiller from "@/src/assets/videos/thriller.mp4";
import { RipplesButton, Loading } from "@/src/components/common";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/src/redux/selectors";

type Props = {};

const Hero = (props: Props) => {
	const navigate = useNavigate();
	const user = useSelector(selectUser);

	const handleClick = () => {
		if (user.name) {
			navigate("/search");
		} else {
			navigate("/sign");
		}
	};

	return (
		<div className="max-w-full w-full flex flex-col gap-y-6 md:flex-row justify-between z-20  ">
			{/* Info section */}
			<div className="flex flex-col items-center md:items-start w-full lg:max-w-[50%] gap-y-4 md:gap-y-6 order-2 md:order-1">
				<h3 className="text-3xl md:text-6xl font-custom font-bold">
					From Bored to Buzzed, Your Next Movie Awaits
				</h3>
				<p className="text-xl text-c_gray-900">
					What2Watch is your AI-powered film guide, curating personalized movie
					recommendations. No guessing needed.
				</p>

				<RipplesButton text="Start now" handleClick={handleClick} />
			</div>
			{/* Video Container */}
			<div className="h-[200px] w-full lg:w-[600px] lg:h-[350px] rounded-lg relative-10 video-container order-1 md:order-2">
				<video
					autoPlay
					loop
					muted
					className="w-full rounded-lg  h-full object-cover"
				>
					<source src={videoTrhiller} type="video/mp4" />
				</video>
			</div>
		</div>
	);
};

export default Hero;
