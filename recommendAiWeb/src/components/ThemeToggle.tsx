import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/src/lib/theme";
import { Button } from "@/src/components/ui/button";

/**
 * Light/dark toggle. Persists the choice and follows `prefers-color-scheme`
 * when no explicit choice has been made (see src/lib/theme.ts).
 */
export function ThemeToggle() {
	const { theme, toggle } = useTheme();
	const isDark = theme === "dark";

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
			title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
			onClick={toggle}
			className="rounded-full"
		>
			<motion.span
				key={theme}
				initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
				animate={{ rotate: 0, opacity: 1, scale: 1 }}
				transition={{ type: "spring", stiffness: 260, damping: 20 }}
				className="flex"
			>
				{isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
			</motion.span>
		</Button>
	);
}
