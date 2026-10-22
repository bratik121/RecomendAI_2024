import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const mediaQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function systemTheme(): Theme {
	return mediaQuery().matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === "light" || value === "dark" ? value : null;
	} catch {
		return null;
	}
}

/** Resolve the theme that should be active right now. */
export function resolveTheme(): Theme {
	return getStoredTheme() ?? systemTheme();
}

/** Apply a theme to <html>. Returns the applied value. */
function apply(theme: Theme): Theme {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
	return theme;
}

export function setTheme(theme: Theme) {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		/* storage unavailable — theme still applies for this session */
	}
	apply(theme);
}

/**
 * React hook for the current theme + toggle.
 *
 * The initial value is read synchronously (already applied by the inline
 * script in index.html) so there is no flash on first render.
 */
export function useTheme() {
	const [theme, setThemeState] = useState<Theme>(() => resolveTheme());

	useEffect(() => {
		const query = mediaQuery();
		const onChange = () => {
			// Only follow the system when the user hasn't chosen explicitly.
			if (!getStoredTheme()) setThemeState(systemTheme());
		};
		query.addEventListener("change", onChange);
		return () => query.removeEventListener("change", onChange);
	}, []);

	const set = useCallback((next: Theme) => {
		setTheme(next);
		setThemeState(next);
	}, []);

	const toggle = useCallback(() => {
		setThemeState((current) => {
			const next: Theme = current === "dark" ? "light" : "dark";
			setTheme(next);
			return next;
		});
	}, []);

	return { theme, setTheme: set, toggle };
}
