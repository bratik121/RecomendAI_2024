import { useLocation } from "react-router-dom";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";
import wathingMovie from "@/src/assets/images/pexels-photo-4009397.webp";
import { motion as m, AnimatePresence } from "framer-motion";
import { opacityVariant } from "@/src/types";
import "./style.css";

const Sign = () => {
	const path = useLocation().pathname;

	return (
		<div className="flex h-screen w-screen  items-center justify-center">
			<div className="flex h-[90%] w-[80%] sign shadow-lg z-20  overflow-hidden relative">
				<m.div
					className="hidden md:block w-[40%] h-full absolute top-0 left-0"
					animate={{ x: path === "/sign/up" ? "150%" : 0 }}
					transition={{
						duration: 0.5,
					}}
				>
					<img
						src={wathingMovie}
						alt=""
						className="w-full h-full object-cover"
					/>
				</m.div>
				<AnimatePresence mode="wait">
					{path === "/sign/in" && (
						<m.div
							className="w-full md:w-[60%]   h-full flex absolute top-0 right-0"
							variants={opacityVariant}
							key={path}
							initial="hidden"
							animate="visible"
							exit="hidden"
						>
							<SignIn />
						</m.div>
					)}
					{path === "/sign/up" && (
						<m.div
							className="w-full md:w-[60%]   h-full flex  overflow-y-scroll "
							variants={opacityVariant}
							key={path}
							initial="hidden"
							animate="visible"
							exit="hidden"
						>
							<SignUp />
						</m.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default Sign;
