import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

const Select = React.forwardRef<
	HTMLSelectElement,
	React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
	<div className="relative">
		<select
			ref={ref}
			className={cn(
				"flex h-10 w-full appearance-none rounded-lg border border-border-subtle bg-surface px-3 pr-8 text-sm text-text-primary shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		>
			{children}
		</select>
		<ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
	</div>
));
Select.displayName = "Select";

export { Select };
