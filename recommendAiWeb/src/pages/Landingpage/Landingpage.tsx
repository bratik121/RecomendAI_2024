import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Trending } from "./Trending";
import { Button } from "@/src/components/ui/button";
import { fadeUp, inViewOnce } from "@/src/lib/motion";

export function Landingpage() {
	const navigate = useNavigate();
	const { t } = useTranslation("landing");

	return (
		<div className="w-full">
			<Hero />

			<div className="border-y border-border-subtle bg-surface/50">
				<HowItWorks />
			</div>

			<Trending />

			{/* Closing CTA */}
			<motion.section
				variants={fadeUp}
				initial="hidden"
				whileInView="visible"
				viewport={inViewOnce}
				className="mx-auto max-w-7xl px-6 pb-24"
			>
				<div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border-subtle bg-surface p-10 text-center shadow-card sm:p-14 md:flex-row md:text-left">
					<div>
						<h2 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
							{t("cta_title")}
						</h2>
						<p className="mt-2 max-w-xl text-text-secondary">{t("cta_desc")}</p>
					</div>
					<Button size="lg" onClick={() => navigate("/sign/up")} className="group">
						{t("cta_button")}
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Button>
				</div>
			</motion.section>
		</div>
	);
}
