import { Lottie } from "lottie-react";
import loading from "@/src/assets/lottie/loading.json";
type Props = {
	size?: number;
};

function Loading({ size = 150 }: Props) {
	return (
		<Lottie
			src={loading}
			autoplay
			loop={true}
			style={{ width: size, height: size }}
		/>
	);
}

export default Loading;
