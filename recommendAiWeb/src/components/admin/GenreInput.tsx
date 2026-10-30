import { useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

type Props = {
	value: string[];
	onChange: (genres: string[]) => void;
	suggestions: string[];
	placeholder?: string;
};

/**
 * Input de géneros con pills y autocompletado (sin dependencias nuevas).
 * - Escribí y presioná Enter para agregar.
 * - X sobre cada pill para quitar.
 * - Sugerencias filtradas de los géneros ya existentes en la DB.
 */
export function GenreInput({ value, onChange, suggestions, placeholder }: Props) {
	const [text, setText] = useState("");
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(-1);
	const containerRef = useRef<HTMLDivElement>(null);

	const filtered = suggestions
		.filter((g) => !value.includes(g))
		.filter((g) => g.toLowerCase().includes(text.trim().toLowerCase()))
		.slice(0, 8);

	const add = (genre: string) => {
		const g = genre.trim();
		if (g && !value.includes(g)) {
			onChange([...value, g]);
		}
		setText("");
		setOpen(false);
		setHighlighted(-1);
	};

	const remove = (genre: string) => {
		onChange(value.filter((g) => g !== genre));
	};

	const commit = () => {
		if (highlighted >= 0 && filtered[highlighted]) {
			add(filtered[highlighted]);
		} else if (text.trim()) {
			add(text);
		}
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			commit();
			return;
		}
		if (e.key === "Backspace" && text === "" && value.length > 0) {
			remove(value[value.length - 1]);
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlighted((h) => Math.min(filtered.length - 1, h + 1));
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlighted((h) => Math.max(-1, h - 1));
			return;
		}
		if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div ref={containerRef} className="relative">
			<div
				className={cn(
					"flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-sm shadow-soft transition-colors",
					"focus-within:border-accent focus-within:ring-2 focus-within:ring-ring/30"
				)}
				onClick={() => containerRef.current?.querySelector("input")?.focus()}
			>
				{value.map((genre) => (
					<span
						key={genre}
						className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent"
					>
						{genre}
						<button
							type="button"
							onClick={() => remove(genre)}
							aria-label={`Quitar ${genre}`}
							className="text-accent/70 transition-colors hover:text-accent"
						>
							<X className="h-3 w-3" />
						</button>
					</span>
				))}
				<input
					value={text}
					onChange={(e) => {
						setText(e.target.value);
						setOpen(true);
						setHighlighted(-1);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={onKeyDown}
					placeholder={value.length === 0 ? placeholder : ""}
					className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
				/>
			</div>

			{open && filtered.length > 0 && (
				<ul
					role="listbox"
					className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border-subtle bg-surface-elevated p-1 text-text-primary shadow-float"
				>
					{filtered.map((genre, i) => (
						<li
							key={genre}
							role="option"
							aria-selected={i === highlighted}
							onMouseEnter={() => setHighlighted(i)}
							onClick={() => add(genre)}
							className={cn(
								"cursor-pointer select-none rounded-lg px-2.5 py-2 text-sm transition-colors",
								i === highlighted ? "bg-accent-soft text-accent" : "text-text-primary"
							)}
						>
							{genre}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
