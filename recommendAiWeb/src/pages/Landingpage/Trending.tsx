import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import movies from "@/src/assets/movies/movies";
import { inViewOnce, staggerContainer, staggerItem } from "@/src/lib/motion";

export function Trending() {
	const { t } = useTranslation("landing");

	return (
		<section className="mx-auto w-full max-w-7xl py-20">
			<div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
				<h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
					{t("trending_title")}{" "}
					<span className="text-accent">{t("trending_now")}</span>
				</h2>
			</div>

			<motion.div
				variants={staggerContainer(0.05)}
				initial="hidden"
				whileInView="visible"
				viewport={inViewOnce}
				className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
			>
				{movies.map((movie) => (
					<motion.div key={movie.id} variants={staggerItem}>
						<Link
							to={`/movie/${movie.id}`}
							className="group block overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card transition-colors hover:border-accent/40"
						>
							<div className="relative aspect-[2/3] overflow-hidden">
								<img
									src={movie.img}
									alt={movie.title}
									loading="lazy"
									className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
								<div className="absolute bottom-3 left-3 right-3">
									<p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
										{movie.title}
									</p>
								</div>
							</div>
						</Link>
					</motion.div>
				))}
			</motion.div>
		</section>
	);
}
