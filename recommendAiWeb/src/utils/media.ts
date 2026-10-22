export const getMediaUrl = (url?: string | null) => {
	if (!url) return null;
	if (url.startsWith("http")) return url;
	return `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || ""}${url}`;
};
