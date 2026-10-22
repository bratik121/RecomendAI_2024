import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clapperboard, ListChecks, Sparkles } from "lucide-react";
import { inViewOnce, staggerContainer, staggerItem } from "@/src/lib/motion";

export function HowItWorks() {
	const { t } = useTranslation("landing");

	const steps = [
		{ icon: Clapperboard, title: t("step1_title"), desc: t("step1_desc") },
		{ icon: Sparkles, title: t("step2_title"), desc: t("step2_desc") },
		{ icon: ListChecks, title: t("step3_title"), desc: t("step3_desc") },
	];

	return (
		<section className="mx-auto w-full max-w-7xl py-20">
			<div className="mx-auto max-w-2xl text-center">
				<h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
					{t("how_title")}
				</h2>
				<p className="mt-4 text-lg text-text-secondary">{t("how_subtitle")}</p>
			</div>

			<motion.ol
				variants={staggerContainer(0.12)}
				initial="hidden"
				whileInView="visible"
				viewport={inViewOnce}
				className="relative mt-14 grid gap-6 md:grid-cols-3"
			>
				{steps.map((step, index) => (
					<motion.li
						key={step.title}
						variants={staggerItem}
						className="relative flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-card"
					>
						<div className="flex items-center gap-4">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
								<step.icon className="h-5 w-5" />
							</div>
							<span className="text-sm font-bold text-accent">
								{String(index + 1).padStart(2, "0")}
							</span>
						</div>
						<h3 className="mt-5 text-lg font-bold text-text-primary">{step.title}</h3>
						<p className="mt-2 text-sm leading-relaxed text-text-secondary">
							{step.desc}
						</p>
					</motion.li>
				))}
			</motion.ol>
		</section>
	);
}
