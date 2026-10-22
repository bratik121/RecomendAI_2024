import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Props = {
	value: number;
	onChange?: (value: number) => void;
	size?: number;
	readOnly?: boolean;
};

/** 1–5 star rating. Interactive unless readOnly; shows hover preview. */
export function StarRating({ value, onChange, size = 22, readOnly = false }: Props) {
	const [hover, setHover] = useState(0);
	const active = hover || value;

	return (
		<div
			className="inline-flex items-center gap-0.5"
			role={readOnly ? "img" : "radiogroup"}
			aria-label={readOnly ? `Calificación: ${value} de 5` : "Calificación"}
			onMouseLeave={() => setHover(0)}
		>
			{[1, 2, 3, 4, 5].map((star) => {
				const filled = star <= active;
				return (
					<button
						key={star}
						type="button"
						disabled={readOnly}
						onClick={() => onChange?.(star)}
						onMouseEnter={() => !readOnly && setHover(star)}
						onFocus={() => !readOnly && setHover(star)}
						onBlur={() => setHover(0)}
						aria-label={`${star} de 5`}
						aria-checked={value === star}
						role={readOnly ? undefined : "radio"}
						className={cn(
							"rounded-sm transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
						)}
					>
						<Star
							style={{ width: size, height: size }}
							className={cn(
								"transition-colors",
								filled ? "fill-star text-star" : "fill-transparent text-text-muted"
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
