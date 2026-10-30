import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";
import watchingMovie from "@/src/assets/images/pexels-photo-4009397.webp";
import { fade } from "@/src/lib/motion";

export function Sign() {
	const { pathname } = useLocation();
	const { t } = useTranslation("landing");
	const isSignUp = pathname === "/sign/up";

	return (
		<div className="flex min-h-screen w-full">
			{/* Brand panel (desktop) */}
			<motion.aside
				variants={fade}
				initial="hidden"
				animate="visible"
				className="relative hidden w-1/2 overflow-hidden lg:block"
			>
				<img
					src={watchingMovie}
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
				<div className="relative flex h-full flex-col justify-end p-12">
					<p className="max-w-md text-3xl font-extrabold leading-tight text-white">
						{t("hero_subtitle")}
					</p>
				</div>
			</motion.aside>

			{/* Form panel */}
			<motion.main
				key={isSignUp ? "up" : "in"}
				initial={{ opacity: 0, x: 16 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
				className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2"
			>
				<div className="w-full max-w-md">
					{isSignUp ? <SignUp /> : <SignIn />}
				</div>
			</motion.main>
		</div>
	);
}
