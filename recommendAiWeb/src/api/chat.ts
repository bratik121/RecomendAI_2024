import { api } from "@/src/api/client";

export interface ChatQuota {
	type: "rank" | "daily";
	limit: number;
	used: number;
	remaining: number;
	rank: string;
}

export interface ChatRecommendedMovie {
	id: number;
	title: string;
	release_year: string;
	genres: string[];
}

export interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	content: string;
	created_at?: string;
}

export interface ChatResponse {
	conversation_id: string;
	message: { id: number; role: "assistant"; content: string };
	recommended_movies: ChatRecommendedMovie[];
	quota: {
		remaining: number;
		limit: number;
		type: "rank" | "daily";
		rank: string;
	};
}

export interface ChatHistoryResponse {
	conversation_id: string;
	messages: ChatMessage[];
}

export const chatApi = {
	async send(message: string, conversationId?: string) {
		const { data } = await api.post<ChatResponse>("/chat/", {
			message,
			conversation_id: conversationId ?? null,
		});
		return data;
	},
	async history(conversationId: string) {
		const { data } = await api.get<ChatHistoryResponse>("/chat/", {
			params: { conversation_id: conversationId },
		});
		return data;
	},
};

export function chatErrorMessage(error: unknown): string {
	const axiosError = error as { response?: { data?: unknown } };
	const data = axiosError.response?.data as Record<string, unknown> | string | undefined;
	if (typeof data === "string") return data;
	if (data && typeof data === "object") {
		const detail = (data as { detail?: unknown }).detail;
		if (typeof detail === "string") return detail;
	}
	return "El asistente no está disponible ahora.";
}
