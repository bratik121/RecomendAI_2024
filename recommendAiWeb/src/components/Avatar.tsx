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
};

/** Initials/avatar used across the app. Falls back to the first letter. */
export function Avatar({ name = "?", src, size = 36, className }: Props) {
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

	return (
		<UIAvatar className={className} style={{ width: size, height: size }}>
			{url && <AvatarImage src={url} alt={name} />}
			<AvatarFallback style={{ fontSize: Math.max(12, size * 0.38) }}>
				{initials || "?"}
			</AvatarFallback>
		</UIAvatar>
	);
}
