import "react-i18next";
import type common from "./locales/es/common.json";
import type nav from "./locales/es/nav.json";
import type landing from "./locales/es/landing.json";
import type auth from "./locales/es/auth.json";
import type movie from "./locales/es/movie.json";
import type watchlist from "./locales/es/watchlist.json";
import type comments from "./locales/es/comments.json";
import type profile from "./locales/es/profile.json";
import type errors from "./locales/es/errors.json";
import type admin from "./locales/es/admin.json";
import type chat from "./locales/es/chat.json";
import type achievements from "./locales/es/achievements.json";

declare module "react-i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		resources: {
			common: typeof common;
			nav: typeof nav;
			landing: typeof landing;
			auth: typeof auth;
			movie: typeof movie;
			watchlist: typeof watchlist;
			comments: typeof comments;
			profile: typeof profile;
			errors: typeof errors;
			admin: typeof admin;
			chat: typeof chat;
			achievements: typeof achievements;
		};
	}
}
