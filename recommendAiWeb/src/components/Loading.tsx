import { Lottie } from "lottie-react";
import loadingAnimation from "@/src/assets/lottie/loading.json";

type Props = {
	size?: number;
	label?: string;
};

/** Full-area branded loader (Lottie) with an optional caption. */
export function Loading({ size = 120, label }: Props) {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<Lottie
				src={loadingAnimation}
				autoplay
				loop
				style={{ width: size, height: size }}
			/>
			{label && <p className="text-sm text-text-muted">{label}</p>}
		</div>
	);
}
