import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster de la app, tematizado con los tokens semánticos del sistema de
 * diseño. Sonner maneja las animaciones de entrada/salida; los estilos por
 * variante se aplican vía `data-sonner-toast` / `data-type` en las clases.
 */
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
					icon: "text-accent",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
