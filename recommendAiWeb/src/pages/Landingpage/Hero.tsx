import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation, Trans } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { selectUser } from "@/src/redux/selectors";
import { Button } from "@/src/components/ui/button";
import { fadeRight, fadeUp } from "@/src/lib/motion";
import videoThriller from "@/src/assets/videos/thriller.mp4";

export function Hero() {
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const { t } = useTranslation("landing");

	const handleClick = () => navigate(user.name ? "/search" : "/sign/up");

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 py-16 lg:flex-row lg:gap-8 lg:py-24">
			{/* Copy */}
			<motion.div
				variants={fadeRight}
				initial="hidden"
				animate="visible"
				className="flex w-full flex-col items-center text-center lg:max-w-[52%] lg:items-start lg:text-left"
			>
				<h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
					<Trans
						i18nKey="landing:hero_title"
						components={{ gradient: <span className="text-accent" /> }}
					/>
				</h1>
				<p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
					{t("hero_subtitle")}
				</p>

				<motion.div
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
				>
					<Button size="lg" onClick={handleClick} className="group">
						{user.name ? t("hero_cta_start") : t("hero_cta_join")}
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Button>
					<Button size="lg" variant="outline" onClick={() => navigate("/search")}>
						<Play className="h-4 w-4" />
						{t("hero_cta_see", { ns: "landing" })}
					</Button>
				</motion.div>
			</motion.div>

			{/* Visual */}
			<motion.div
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="w-full max-w-xl lg:w-[46%]"
			>
				<div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-float">
					<div className="aspect-video">
						<video
							autoPlay
							loop
							muted
							playsInline
							className="h-full w-full object-cover"
						>
							<source src={videoThriller} type="video/mp4" />
						</video>
					</div>
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
				</div>
			</motion.div>
		</div>
	);
}
