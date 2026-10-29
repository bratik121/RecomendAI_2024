import { api } from "@/src/api/client";

export interface AchievementItem {
	key: string;
	name: string;
	description: string;
	icon: string;
	category: string;
	target: number;
	unlocked: boolean;
	unlocked_at: string | null;
	progress: number;
}

export interface RankInfo {
	key: string;
	label: string;
	color: string;
	next_threshold: number | null;
	next_label: string | null;
	next_color: string | null;
	progress: number;
}

export interface AchievementsResponse {
	unlocked_count: number;
	total_count: number;
	rank: RankInfo;
	achievements: AchievementItem[];
}

export const achievementsApi = {
	async summary() {
		const { data } = await api.get<AchievementsResponse>("/achievements/");
		return data;
	},
};
