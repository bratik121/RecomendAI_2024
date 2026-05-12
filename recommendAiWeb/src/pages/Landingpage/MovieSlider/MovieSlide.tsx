import { motion } from "framer-motion";

type Props = {
	img: string;
	title: string;
};

const MovieSlide = ({ img, title }: Props) => {
	return (
		<motion.div 
			whileHover={{ y: -10 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className="flex flex-col gap-y-3 w-fit h-fit group cursor-pointer"
		>
			<div className="h-[280px] w-[200px] rounded-xl overflow-hidden shadow-lg border border-white/5 relative">
				<div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 transition-colors duration-300 z-10"></div>
				<img src={img} alt={title} className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
			</div>
			<div className="text-center font-medium text-c_gray-200 group-hover:text-primary-400 transition-colors line-clamp-1 max-w-[200px]">
				{title}
			</div>
		</motion.div>
	);
};

export default MovieSlide;
