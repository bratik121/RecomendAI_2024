import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SelectOption = {
	value: string;
	label: React.ReactNode;
	disabled?: boolean;
};

type SelectProps = {
	value?: string;
	onChange?: (e: { target: { value: string } }) => void;
	className?: string;
	disabled?: boolean;
	placeholder?: string;
	children: React.ReactNode;
};

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
	(
		{ value, onChange, className, disabled, placeholder, children, ...props },
		ref
	) => {
		const [open, setOpen] = React.useState(false);
		const [highlighted, setHighlighted] = React.useState<number>(-1);
		const containerRef = React.useRef<HTMLDivElement>(null);

		// Extrae las opciones de los <option> hijos.
		const options = React.useMemo<SelectOption[]>(() => {
			return React.Children.toArray(children)
				.filter(React.isValidElement)
				.map((child) => {
					const el = child as React.ReactElement<{
						value: string;
						children: React.ReactNode;
						disabled?: boolean;
					}>;
					return {
						value: el.props.value,
						label: el.props.children,
						disabled: el.props.disabled,
					};
				});
		}, [children]);

		const selected = options.find((opt) => opt.value === value);

		// Cierra al hacer click fuera.
		React.useEffect(() => {
			if (!open) return;
			const onPointerDown = (event: PointerEvent) => {
				if (
					containerRef.current &&
					!containerRef.current.contains(event.target as Node)
				) {
					setOpen(false);
				}
			};
			document.addEventListener("pointerdown", onPointerDown);
			return () => document.removeEventListener("pointerdown", onPointerDown);
		}, [open]);

		// Cierra con Escape.
		React.useEffect(() => {
			if (!open) return;
			const onKey = (event: KeyboardEvent) => {
				if (event.key === "Escape") setOpen(false);
			};
			document.addEventListener("keydown", onKey);
			return () => document.removeEventListener("keydown", onKey);
		}, [open]);

		// Resetea el highlight al abrir.
		React.useEffect(() => {
			if (open) {
				const index = options.findIndex((opt) => opt.value === value);
				setHighlighted(index >= 0 ? index : 0);
			} else {
				setHighlighted(-1);
			}
		}, [open, options, value]);

		const commit = (option: SelectOption) => {
			if (option.disabled) return;
			onChange?.({ target: { value: option.value } });
			setOpen(false);
		};

		const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
			if (disabled) return;

			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				if (!open) {
					setOpen(true);
					return;
				}
				setHighlighted((prev) => {
					const dir = event.key === "ArrowDown" ? 1 : -1;
					let next = prev + dir;
					if (next < 0) next = options.length - 1;
					if (next >= options.length) next = 0;
					return next;
				});
			}

			if ((event.key === "Enter" || event.key === " ") && open) {
				event.preventDefault();
				const option = options[highlighted];
				if (option) commit(option);
			}

			if (event.key === "Enter" || event.key === " ") {
				if (!open) {
					event.preventDefault();
					setOpen(true);
				}
			}
		};

		return (
			<div ref={containerRef} className={cn("relative w-full", className)}>
				<button
					ref={ref}
					type="button"
					disabled={disabled}
					onClick={() => setOpen((prev) => !prev)}
					onKeyDown={onKeyDown}
					aria-haspopup="listbox"
					aria-expanded={open}
					className={cn(
						"flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface px-3 pr-2 text-sm text-text-primary shadow-soft transition-colors",
						"hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:border-accent",
						"disabled:cursor-not-allowed disabled:opacity-50",
						open && "border-accent ring-2 ring-ring/30"
					)}
					{...props}
				>
					<span
						className={cn("truncate text-left", !selected && "text-text-muted")}
					>
						{selected ? selected.label : placeholder}
					</span>
					<motion.span
						animate={{ rotate: open ? 180 : 0 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="flex items-center"
					>
						<ChevronDown className="h-4 w-4 text-text-muted" />
					</motion.span>
				</button>

				<AnimatePresence>
					{open && (
						<motion.ul
							role="listbox"
							initial={{ opacity: 0, y: -6, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.98 }}
							transition={{ duration: 0.15, ease: "easeOut" }}
							className={cn(
								"absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-border-subtle bg-surface-elevated p-1 text-text-primary shadow-float"
							)}
						>
							{options.map((option, index) => {
								const isSelected = option.value === value;
								const isHighlighted = index === highlighted;
								return (
									<motion.li
										key={option.value}
										role="option"
										aria-selected={isSelected}
										aria-disabled={option.disabled}
										onMouseEnter={() => setHighlighted(index)}
										onClick={() => commit(option)}
										whileTap={{ scale: 0.98 }}
										className={cn(
											"flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
											option.disabled && "pointer-events-none opacity-50",
											isSelected ? "text-accent" : "text-text-primary",
											isHighlighted && "bg-accent-soft text-accent"
										)}
									>
										<span className="truncate">{option.label}</span>
										{isSelected && (
											<Check className="h-4 w-4 shrink-0 text-accent" />
										)}
									</motion.li>
								);
							})}
						</motion.ul>
					)}
				</AnimatePresence>
			</div>
		);
	}
);
Select.displayName = "Select";

export { Select };
