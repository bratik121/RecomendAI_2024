import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Award,
	Bookmark,
	Bot,
	Eye,
	Heart,
	Lock,
	MessageCircle,
	Star,
	type LucideIcon,
} from "lucide-react";
import {
	achievementsApi,
	AchievementItem,
	RankInfo,
} from "@/src/api/achievements";
import { Loading } from "@/src/components/Loading";
import { EmptyState } from "@/src/components/EmptyState";
import { Button } from "@/src/components/ui/button";
import { fadeUp, staggerContainer, staggerItem } from "@/src/lib/motion";
import { rankStyle } from "@/src/lib/ranks";
import { cn } from "@/src/lib/utils";

const ICONS: Record<string, LucideIcon> = {
	Star,
	MessageCircle,
	Bookmark,
	Bot,
	Eye,
	Heart,
	Award,
};

function AchievementCard({ item }: { item: AchievementItem }) {
	const { t } = useTranslation("achievements");
	const Icon = ICONS[item.icon] ?? Award;
	const unlocked = item.unlocked;
	const pct = Math.min(100, Math.round((item.progress / item.target) * 100));

	return (
		<motion.div
			variants={staggerItem}
			className={cn(
				"flex flex-col gap-3 rounded-2xl border p-4 transition-colors",
				unlocked
					? "border-accent/30 bg-accent-soft"
					: "border-border-subtle bg-surface opacity-90"
			)}
		>
			<div className="flex items-center justify-between">
				<span
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-xl",
						unlocked
							? "bg-accent text-accent-foreground"
							: "bg-surface-elevated text-text-muted"
					)}
				>
					<Icon className="h-5 w-5" />
				</span>
				<span
					className={cn(
						"text-[11px] font-semibold uppercase tracking-wide",
						unlocked ? "text-accent" : "text-text-muted"
					)}
				>
					{unlocked ? t("unlocked") : t("locked")}
				</span>
			</div>

			<div>
				<p className="text-sm font-bold text-text-primary">{item.name}</p>
				<p className="mt-0.5 text-xs text-text-secondary">{item.description}</p>
			</div>

			<div className="mt-auto">
				<div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
					<span>
						{t("progressLabel", {
							progress: item.progress,
							target: item.target,
						})}
					</span>
					{!unlocked && <Lock className="h-3 w-3" />}
				</div>
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
					<div
						className="h-full rounded-full bg-accent transition-all"
						style={{ width: `${pct}%` }}
					/>
				</div>
			</div>
		</motion.div>
	);
}

export function AchievementsPage() {
	const { t } = useTranslation("achievements");
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["achievements"],
		queryFn: achievementsApi.summary,
		staleTime: 30_000,
	});

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loading label={t("title")} />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="mx-auto max-w-xl px-4 py-16">
				<EmptyState
					icon={<Award className="h-7 w-7" />}
					title={t("title")}
					description={t("subtitle")}
					action={<Button onClick={() => refetch()}>{t("title")}</Button>}
				/>
			</div>
		);
	}

	const rank = data.rank as RankInfo;
	const style = rankStyle(rank.color);
	const rankLabel = t(`ranks.${rank.key}`, { defaultValue: rank.label });
	const nextLabel = rank.next_key
		? t(`ranks.${rank.next_key}`, { defaultValue: rank.next_label ?? "" })
		: null;
	const nextPct = rank.next_threshold
		? Math.min(100, Math.round((rank.progress / rank.next_threshold) * 100))
		: 100;

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
			<motion.div variants={fadeUp} initial="hidden" animate="visible">
				<h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
					{t("title")}
				</h1>
				<p className="mt-2 max-w-xl text-text-secondary">{t("subtitle")}</p>
			</motion.div>

			{/* Rango actual y progreso */}
			<motion.section
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="mt-8 rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8"
			>
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<span
							className="flex h-16 w-16 items-center justify-center rounded-2xl"
							style={{ backgroundColor: style.bg, color: style.fg }}
						>
							<Award className="h-8 w-8" />
						</span>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
								{t("rankTitle")}
							</p>
							<p
								className="text-2xl font-extrabold"
								style={{ color: style.fg }}
							>
								{rankLabel}
							</p>
						</div>
					</div>
					<div className="text-left sm:text-right">
						<p className="text-sm font-semibold text-text-primary">
							{t("unlockedCount", {
								count: data.unlocked_count,
								total: data.total_count,
							})}
						</p>
						<p className="text-xs text-text-muted">
							{rank.override
								? t("manualRank")
								: rank.next_threshold
									? t("progressToNext", {
											count: rank.next_threshold - rank.progress,
											rank: nextLabel,
										})
									: t("maxRank")}
						</p>
					</div>
				</div>
				<div className="mt-6">
					<div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-elevated">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: `${nextPct}%` }}
							transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							className="h-full rounded-full"
							style={{ backgroundColor: style.fg }}
						/>
					</div>
					<div className="mt-2 flex justify-between text-[11px] text-text-muted">
						<span>{rankLabel}</span>
						<span>{nextLabel ?? rankLabel}</span>
					</div>
				</div>
			</motion.section>

			{/* Explicación breve */}
			<motion.section
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="mt-6 rounded-2xl border border-border-subtle bg-surface-elevated/40 p-5"
			>
				<h2 className="text-sm font-bold text-text-primary">
					{t("howItWorksTitle")}
				</h2>
				<p className="mt-1 text-sm text-text-secondary">
					{t("howItWorksBody")}
				</p>
			</motion.section>

			{/* Lista de logros agrupados por categoría */}
			{(() => {
				const categories = Array.from(
					new Set(data.achievements.map((a) => a.category))
				);
				return categories.map((category) => {
					const items = data.achievements.filter(
						(a) => a.category === category
					);
					const label = t(`categories.${category}`, { defaultValue: category });
					return (
						<motion.section
							key={category}
							variants={staggerContainer(0.04)}
							initial="hidden"
							animate="visible"
							className="mt-8"
						>
							<h2 className="mb-3 text-lg font-bold text-text-primary">
								{label}
							</h2>
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{items.map((item) => (
									<AchievementCard key={item.key} item={item} />
								))}
							</div>
						</motion.section>
					);
				});
			})()}
		</div>
	);
}
