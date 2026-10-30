import axios from "axios";
import { storage } from "@/src/helpers";
import i18n from "@/src/i18n";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
	const token = storage.get("token");
	if (token) {
		config.headers.Authorization = `Token ${token}`;
	}
	// Idioma activo de la app → el backend localiza logros/rangos.
	config.headers["Accept-Language"] = i18n.language || "es";
	return config;
});
