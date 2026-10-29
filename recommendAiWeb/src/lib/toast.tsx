import { toast as sonner } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * API de notificaciones de RecomendAI.
 *
 * Unifica las variantes (success, error, info, warning) con un ícono por
 * defecto consistente con la UI. Internamente usa Sonner, que ya está integrado
 * con el sistema de diseño (ver `src/components/ui/sonner.tsx`).
 */
export const toast = {
	success(message: string, description?: string) {
		return sonner.success(message, {
			description,
			icon: <CheckCircle2 className="h-5 w-5" />,
		});
	},
	error(message: string, description?: string) {
		return sonner.error(message, {
			description,
			icon: <AlertCircle className="h-5 w-5" />,
		});
	},
	info(message: string, description?: string) {
		return sonner.info(message, {
			description,
			icon: <Info className="h-5 w-5" />,
		});
	},
	warning(message: string, description?: string) {
		return sonner.warning(message, {
			description,
			icon: <AlertTriangle className="h-5 w-5" />,
		});
	},
};

export { sonner };
