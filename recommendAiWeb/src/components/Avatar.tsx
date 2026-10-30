import {
	Avatar as UIAvatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { getMediaUrl } from "@/src/utils";

type Props = {
	name?: string;
	src?: string | null;
	size?: number;
	className?: string;
	/** Color del anillo (token CSS `var(--rank-...-fg)`) para el rango. */
	ringColor?: string;
};

/** Initials/avatar used across the app. Falls back to the first letter. */
export function Avatar({ name = "?", src, size = 36, className, ringColor }: Props) {
	const url =
		src?.startsWith("blob:") || src?.startsWith("data:")
			? src
			: getMediaUrl(src);
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");

	const ringStyle = ringColor
		? { boxShadow: `0 0 0 2px ${ringColor}, 0 0 0 4px var(--surface)` }
		: undefined;

	return (
		<UIAvatar
			className={className}
			style={{ width: size, height: size, ...ringStyle }}
		>
			{url && <AvatarImage src={url} alt={name} />}
			<AvatarFallback style={{ fontSize: Math.max(12, size * 0.38) }}>
				{initials || "?"}
			</AvatarFallback>
		</UIAvatar>
	);
}
