import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Cell,
	CartesianGrid,
	Pie,
	PieChart,
	Tooltip,
	XAxis,
	YAxis,
	ChartCard,
	chartColors,
	accentColor,
} from "@/src/components/admin/charts";
import { KpiCard } from "@/src/components/admin/KpiCard";
import { Select } from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/EmptyState";
import { adminApi, adminErrorMessage, MetricsOverview } from "@/src/api/admin";
import { toast } from "@/src/lib/toast";

export default function MetricsDashboard() {
	const { t } = useTranslation("admin");
	const [range, setRange] = useState("30d");

	const {
		data,
		isLoading: loading,
		error,
	} = useQuery<MetricsOverview>({
		queryKey: ["admin", "metrics", range],
		queryFn: () => adminApi.metrics(range),
		// Caché en cliente: evita peticiones repetidas al backend al volver.
		staleTime: 45_000,
		gcTime: 5 * 60_000,
	});

	useEffect(() => {
		if (error) {
			const message = adminErrorMessage(error);
			toast.error(message);
		}
	}, [error]);

	if (loading) {
		return (
			<div className="grid gap-4">
				<Skeleton className="h-10 w-48" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 rounded-2xl" />
					))}
				</div>
				<div className="grid gap-4 lg:grid-cols-2">
					<Skeleton className="h-72 rounded-2xl" />
					<Skeleton className="h-72 rounded-2xl" />
				</div>
			</div>
		);
	}

	if (error || !data) {
		const message = error ? adminErrorMessage(error) : "";
		return <EmptyState title={t("metrics.errorTitle")} description={message || t("metrics.error")} />;
	}

	const pieData = data.rating_distribution.map((d) => ({ name: `${d.rating}★`, value: d.count }));
	const genreData = data.popular_genres;
	const genreColors = chartColors(genreData.length);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
					{t("metrics.title")}
				</h1>
				<div className="w-full sm:w-44">
					<Select
						value={range}
						onChange={(e) => setRange(e.target.value)}
						aria-label={t("metrics.rangeLabel")}
					>
						<option value="7d">{t("metrics.ranges.7d")}</option>
						<option value="30d">{t("metrics.ranges.30d")}</option>
						<option value="90d">{t("metrics.ranges.90d")}</option>
						<option value="all">{t("metrics.ranges.all")}</option>
					</Select>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiCard label={t("metrics.kpis.users")} value={data.kpis.users} />
				<KpiCard label={t("metrics.kpis.activeUsers")} value={data.kpis.active_users} />
				<KpiCard label={t("metrics.kpis.movies")} value={data.kpis.movies} />
				<KpiCard label={t("metrics.kpis.ratings")} value={data.kpis.ratings} />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard title={t("metrics.registrations")} description={t("metrics.registrationsHint")}>
					<AreaChart data={data.registrations}>
						<defs>
							<linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={accentColor()} stopOpacity={0.4} />
								<stop offset="95%" stopColor={accentColor()} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
						<XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<Tooltip />
						<Area type="monotone" dataKey="count" name="Usuarios" stroke={accentColor()} fill="url(#reg)" />
					</AreaChart>
				</ChartCard>

				<ChartCard title={t("metrics.comments")}>
					<AreaChart data={data.comments}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
						<XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<Tooltip />
						<Area type="monotone" dataKey="count" name="Comentarios" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
					</AreaChart>
				</ChartCard>

				<ChartCard title={t("metrics.interactions")}>
					<AreaChart data={data.interactions}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
						<XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<Tooltip />
						<Area type="monotone" dataKey="count" name="Interacciones" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
					</AreaChart>
				</ChartCard>

				<ChartCard title={t("metrics.topSeen")}>
					<BarChart data={data.top_seen_movies} layout="vertical" margin={{ left: 8 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
						<XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<YAxis
							type="category"
							dataKey="title"
							width={140}
							tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
						/>
						<Tooltip />
						<Bar dataKey="count" name="Vistas" fill={accentColor()} radius={[0, 4, 4, 0]} />
					</BarChart>
				</ChartCard>

				<ChartCard title={t("metrics.genres")}>
					<BarChart data={genreData} layout="vertical" margin={{ left: 8 }}>
						<CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
						<XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
						<YAxis
							type="category"
							dataKey="genre"
							width={120}
							tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
						/>
						<Tooltip />
						<Bar dataKey="count" name="Interacciones" radius={[0, 4, 4, 0]}>
							{genreData.map((_, i) => (
								<Cell key={i} fill={genreColors[i]} />
							))}
						</Bar>
					</BarChart>
				</ChartCard>

				<ChartCard title={t("metrics.ratings")} height={280}>
					<PieChart>
						<Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
							{pieData.map((_, i) => (
								<Cell key={i} fill={chartColors(pieData.length)[i]} />
							))}
						</Pie>
						<Tooltip />
					</PieChart>
				</ChartCard>
			</div>

			{data.note && (
				<p className="text-xs text-text-muted">{data.note}</p>
			)}
		</div>
	);
}
