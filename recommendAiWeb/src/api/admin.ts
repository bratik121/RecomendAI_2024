import { api } from "@/src/api/client";

export type UserRole = "root" | "admin" | "user";

export interface AdminUser {
	id: number;
	email: string;
	name: string;
	lastname: string;
	bio?: string;
	avatar?: string | null;
	role: UserRole;
	rank?: string;
	rank_color?: string;
	is_active: boolean;
	created_at: string;
}

export interface AdminMovie {
	id: number;
	title: string;
	poster_path: string;
	poster_image?: string | null;
	poster_url?: string | null;
	release_year: string;
	overview: string;
	popularity: number;
	vote_average: number;
	revenue: number;
	genres: string[];
	is_active: boolean;
}

export type MovieInput = Omit<AdminMovie, "id" | "poster_image" | "poster_url" | "is_active"> & {
	poster_image?: File | null;
};

export interface AdminComment {
	id: number;
	body: string;
	is_deleted: boolean;
	created_at: string;
	user: { id: number; name: string; lastname: string };
	movie?: number;
}

export interface Paginated<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface MetricsOverview {
	range: string;
	kpis: {
		users: number;
		active_users: number;
		movies: number;
		comments: number;
		ratings: number;
	};
	registrations: { date: string; count: number }[];
	interactions: { date: string; count: number }[];
	top_seen_movies: { movie_id: number; title: string; count: number }[];
	rating_distribution: { rating: number; count: number }[];
	popular_genres: { genre: string; count: number }[];
	comments: { date: string; count: number }[];
	note?: string;
}

const listParams = (params: Record<string, unknown>) => {
	const clean = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== null)
	);
	return { params: clean };
};

export const adminApi = {
	// -------- Películas --------
	async listMovies(query: {
		search?: string;
		active?: boolean;
		page?: number;
		page_size?: number;
	}) {
		const { data } = await api.get<Paginated<AdminMovie>>(
			"/admin/movies/",
			listParams(query)
		);
		return data;
	},
	async listGenres() {
		const { data } = await api.get<{ genres: string[] }>("/admin/movies/genres/");
		return data.genres;
	},
	async createMovie(payload: MovieInput) {
		const form = toFormData(payload);
		const { data } = await api.post<AdminMovie>("/admin/movies/", form);
		return data;
	},
	async updateMovie(id: number, payload: MovieInput) {
		const form = toFormData(payload);
		const { data } = await api.patch<AdminMovie>(`/admin/movies/${id}/`, form);
		return data;
	},
	async archiveMovie(id: number) {
		const { data } = await api.delete<AdminMovie>(`/admin/movies/${id}/`);
		return data;
	},
	async restoreMovie(id: number) {
		const { data } = await api.post<AdminMovie>(`/admin/movies/${id}/restore/`);
		return data;
	},

	// -------- Usuarios --------
	async listUsers(query: {
		search?: string;
		role?: UserRole;
		is_active?: boolean;
		page?: number;
		page_size?: number;
	}) {
		const { data } = await api.get<Paginated<AdminUser>>(
			"/admin/users/",
			listParams(query)
		);
		return data;
	},
	async createUser(payload: {
		email: string;
		name: string;
		lastname: string;
		password: string;
		bio?: string;
	}) {
		const { data } = await api.post<AdminUser>("/admin/users/", payload);
		return data;
	},
	async updateUser(
		id: number,
		payload: { email?: string; name?: string; lastname?: string; bio?: string; password?: string }
	) {
		const { data } = await api.patch<AdminUser>(`/admin/users/${id}/`, payload);
		return data;
	},
	async deactivateUser(id: number) {
		const { data } = await api.delete<AdminUser>(`/admin/users/${id}/`);
		return data;
	},
	async activateUser(id: number) {
		const { data } = await api.post<AdminUser>(`/admin/users/${id}/activate/`);
		return data;
	},
	async setRole(id: number, role: UserRole) {
		const { data } = await api.post<AdminUser>(`/admin/users/${id}/set_role/`, { role });
		return data;
	},
	async setRank(id: number, rank: string) {
		const { data } = await api.patch<AdminUser>(`/admin/users/${id}/`, { rank });
		return data;
	},

	// -------- Comentarios --------
	async listComments(query: {
		search?: string;
		is_deleted?: boolean;
		page?: number;
		page_size?: number;
	}) {
		const { data } = await api.get<Paginated<AdminComment>>(
			"/admin/comments/",
			listParams(query)
		);
		return data;
	},
	async moderateComment(id: number) {
		const { data } = await api.post<AdminComment>(`/admin/comments/${id}/moderate/`);
		return data;
	},

	// -------- Métricas --------
	async metrics(range: string) {
		const { data } = await api.get<MetricsOverview>("/admin/metrics/overview/", {
			params: { range },
		});
		return data;
	},
};

function toFormData(payload: Record<string, unknown>) {
	const form = new FormData();
	for (const [key, value] of Object.entries(payload)) {
		if (value === undefined || value === null) continue;
		if (Array.isArray(value)) {
			form.append(key, JSON.stringify(value));
		} else {
			form.append(key, value as string | Blob);
		}
	}
	return form;
}

export function adminErrorMessage(error: unknown): string {
	const axiosError = error as { response?: { data?: unknown } };
	const data = axiosError.response?.data as Record<string, unknown> | string | undefined;
	if (typeof data === "string") return data;
	if (data && typeof data === "object") {
		const detail = (data as { detail?: unknown }).detail;
		if (typeof detail === "string") return detail;
		const first = Object.values(data as Record<string, unknown>)[0];
		if (Array.isArray(first) && typeof first[0] === "string") return first[0];
		if (typeof first === "string") return first;
	}
	return "Ocurrió un error inesperado.";
}
