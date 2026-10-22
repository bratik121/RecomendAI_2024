import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
	return (
		<Sonner
			theme={theme}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-surface group-[.toaster]:text-text-primary group-[.toaster]:border-border-subtle group-[.toaster]:shadow-float group-[.toaster]:rounded-xl",
					description: "group-[.toast]:text-text-muted",
					actionButton:
						"group-[.toast]:bg-accent group-[.toast]:text-accent-foreground",
					cancelButton:
						"group-[.toast]:bg-surface-elevated group-[.toast]:text-text-muted",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
