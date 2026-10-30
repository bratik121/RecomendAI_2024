import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const isEnglish = i18n.language?.startsWith("en");

	const toggle = () => i18n.changeLanguage(isEnglish ? "es" : "en");

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggle}
			aria-label={isEnglish ? "Cambiar a español" : "Switch to English"}
			title={isEnglish ? "Cambiar a español" : "Switch to English"}
			className="gap-1.5 rounded-full px-2.5"
		>
			<Languages className="h-4 w-4" />
			<span className="text-xs font-semibold">{isEnglish ? "EN" : "ES"}</span>
		</Button>
	);
}
