import * as React from "react";
import { cn } from "@/src/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-11 w-full rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-sm text-text-primary shadow-soft transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = "Input";

export { Input };
