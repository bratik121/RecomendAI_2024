/**
 * Utilidades compartidas de rangos.
 *
 * El backend devuelve `rank_color` como un token semántico (`rank-novato`,
 * `rank-explorador`, ...). Acá mapeamos ese token a las variables CSS
 * (definidas en `src/index.css`) que garantizan contraste AA en claro/oscuro.
 */

export type RankKey = "novato" | "explorador" | "cinefilo" | "critico" | "maestro";

export const RANK_KEYS: RankKey[] = [
	"novato",
	"explorador",
	"cinefilo",
	"critico",
	"maestro",
];

export const RANK_STYLES: Record<string, { bg: string; fg: string }> = {
	"rank-novato": { bg: "var(--rank-novato-bg)", fg: "var(--rank-novato-fg)" },
	"rank-explorador": {
		bg: "var(--rank-explorador-bg)",
		fg: "var(--rank-explorador-fg)",
	},
	"rank-cinefilo": {
		bg: "var(--rank-cinefilo-bg)",
		fg: "var(--rank-cinefilo-fg)",
	},
	"rank-critico": {
		bg: "var(--rank-critico-bg)",
		fg: "var(--rank-critico-fg)",
	},
	"rank-maestro": {
		bg: "var(--rank-maestro-bg)",
		fg: "var(--rank-maestro-fg)",
	},
};

export function rankStyle(color: string | null | undefined) {
	return RANK_STYLES[color ?? ""] ?? RANK_STYLES["rank-novato"];
}
