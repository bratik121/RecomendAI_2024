import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Popcorn } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { fadeUp } from "@/src/lib/motion";

export function NotFound() {
	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4 py-20">
			<motion.div
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="flex max-w-lg flex-col items-center text-center"
			>
				<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-soft text-accent">
					<Popcorn className="h-10 w-10" />
				</div>
				<p className="text-7xl font-extrabold tracking-tight text-text-primary">
					404
				</p>
				<h1 className="mt-4 text-2xl font-bold text-text-primary">
					Página no encontrada
				</h1>
				<p className="mt-2 max-w-sm text-text-secondary">
					Parece que esta película no está en cartelera. Volvé al inicio o descubrí
					algo nuevo.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link to="/">
						<Button className="w-full sm:w-auto">
							<ArrowLeft className="h-4 w-4" />
							Volver al inicio
						</Button>
					</Link>
					<Link to="/search">
						<Button variant="outline" className="w-full sm:w-auto">
							Descubrir películas
						</Button>
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
