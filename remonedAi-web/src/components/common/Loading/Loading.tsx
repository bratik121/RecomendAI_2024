import React from "react";
import Lottie from "lottie-react";
import loading from "@/src/assets/lottie/loading.json";
type Props = {
	size?: number;
};

function Loading({ size = 150 }: Props) {
	return (
		<Lottie
			animationData={loading}
			loop={true}
			style={{ width: size, height: size }}
		/>
	);
}

export default Loading;
