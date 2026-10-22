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

/* Module-level current theme + subscription so every useTheme() instance
   stays in sync (e.g. the desktop and mobile toggles). */
let current: Theme = resolveTheme();
const listeners = new Set<(theme: Theme) => void>();

export function setTheme(theme: Theme) {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		/* storage unavailable — theme still applies for this session */
	}
	current = apply(theme);
	listeners.forEach((listener) => listener(current));
}

export function getTheme(): Theme {
	return current;
}

/**
 * React hook for the current theme + toggle.
 *
 * The initial value is read synchronously (already applied by the inline
 * script in index.html) so there is no flash on first render.
 */
export function useTheme() {
	const [theme, setThemeState] = useState<Theme>(current);

	useEffect(() => {
		const listener = (next: Theme) => setThemeState(next);
		listeners.add(listener);

		const query = mediaQuery();
		const onSystemChange = () => {
			// Only follow the system when the user hasn't chosen explicitly.
			if (!getStoredTheme()) setTheme(systemTheme());
		};
		query.addEventListener("change", onSystemChange);

		return () => {
			listeners.delete(listener);
			query.removeEventListener("change", onSystemChange);
		};
	}, []);

	const set = useCallback((next: Theme) => setTheme(next), []);

	const toggle = useCallback(
		() => setTheme(current === "dark" ? "light" : "dark"),
		[]
	);

	return { theme, setTheme: set, toggle };
}
