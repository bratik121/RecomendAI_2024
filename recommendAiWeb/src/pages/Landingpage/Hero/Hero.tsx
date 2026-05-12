import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/src/redux/selectors";
import { motion } from "framer-motion";
import videoTrhiller from "@/src/assets/videos/thriller.mp4";
import { RipplesButton } from "@/src/components/common";
import "./style.css";

const Hero = () => {
	const navigate = useNavigate();
	const user = useSelector(selectUser);

	const handleClick = () => {
		if (user.name) {
			navigate("/search");
		} else {
			navigate("/sign/up");
		}
	};

	return (
		<div className="max-w-7xl mx-auto w-full flex flex-col gap-y-12 lg:flex-row items-center justify-between z-20 py-16 lg:py-24">
			{/* Info section */}
			<motion.div 
				initial={{ opacity: 0, x: -50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="flex flex-col items-center lg:items-start w-full lg:max-w-[45%] gap-y-6 order-2 lg:order-1 text-center lg:text-left"
			>
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-custom font-extrabold leading-tight text-white tracking-tight">
					Your Next Favorite Movie <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Awaits</span>
				</h1>
				<p className="text-lg md:text-xl text-c_gray-500 font-medium leading-relaxed">
					What2Watch is your AI-powered film guide, curating personalized movie recommendations. Say goodbye to endless scrolling.
				</p>

				<div className="mt-4">
					<RipplesButton text={user.name ? "Start Discovering" : "Join for Free"} handleClick={handleClick} />
				</div>
			</motion.div>
			
			{/* Video Container */}
			<motion.div 
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="w-full lg:w-[55%] aspect-video rounded-2xl relative order-1 lg:order-2 group"
			>
				{/* Glowing background effect */}
				<div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-c_dark_blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
				
				<div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
					<div className="absolute inset-0 bg-c_dark_blue-600/20 mix-blend-overlay z-10 pointer-events-none"></div>
					<video
						autoPlay
						loop
						muted
						playsInline
						className="w-full h-full object-cover scale-105"
					>
						<source src={videoTrhiller} type="video/mp4" />
					</video>
				</div>
			</motion.div>
		</div>
	);
};

export default Hero;
