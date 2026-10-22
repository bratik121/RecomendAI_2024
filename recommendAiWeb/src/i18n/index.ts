import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import common from "./locales/es/common.json";
import nav from "./locales/es/nav.json";
import landing from "./locales/es/landing.json";
import auth from "./locales/es/auth.json";
import movie from "./locales/es/movie.json";
import watchlist from "./locales/es/watchlist.json";
import comments from "./locales/es/comments.json";
import profile from "./locales/es/profile.json";
import errors from "./locales/es/errors.json";

import commonEn from "./locales/en/common.json";
import navEn from "./locales/en/nav.json";
import landingEn from "./locales/en/landing.json";
import authEn from "./locales/en/auth.json";
import movieEn from "./locales/en/movie.json";
import watchlistEn from "./locales/en/watchlist.json";
import commentsEn from "./locales/en/comments.json";
import profileEn from "./locales/en/profile.json";
import errorsEn from "./locales/en/errors.json";

const resources = {
	es: { common, nav, landing, auth, movie, watchlist, comments, profile, errors },
	en: {
		common: commonEn,
		nav: navEn,
		landing: landingEn,
		auth: authEn,
		movie: movieEn,
		watchlist: watchlistEn,
		comments: commentsEn,
		profile: profileEn,
		errors: errorsEn,
	},
} as const;

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "es",
		supportedLngs: ["es", "en"],
		nonExplicitSupportedLngs: true,
		defaultNS: "common",
		interpolation: { escapeValue: false },
		detection: {
			order: ["localStorage", "navigator", "htmlTag"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
	});

i18n.on("languageChanged", (lng) => {
	document.documentElement.lang = lng;
});

export default i18n;
