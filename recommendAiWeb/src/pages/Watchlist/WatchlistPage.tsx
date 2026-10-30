import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Trash2, BookmarkPlus } from "lucide-react";
import { useWatchlist } from "@/src/redux/hooks/useWatchlist";
import { getPosterUrl } from "@/src/utils";
import { IWatchlistItem } from "@/src/redux/Interfaces";
import { WatchlistRow } from "./WatchlistRow";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { Loading } from "@/src/components/Loading";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

export function WatchlistPage() {
	const { t } = useTranslation("watchlist");
	const { items, summary, loading, error, markWatched, remove } = useWatchlist();

	const pending = useMemo(() => items.filter((item) => !item.watched), [items]);
	const watchedItems = useMemo(() => items.filter((item) => item.watched), [items]);

	if (loading && items.length === 0) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loading label="Cargando tu watchlist..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-xl px-4 py-16">
				<ErrorState title="No pudimos cargar tu watchlist" description={error} />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
						{t("title")}
					</h1>
					<p className="mt-1.5 text-sm text-text-muted">
						{summary.pending} {t("pending").toLowerCase()} · {summary.watched}{" "}
						{t("watched").toLowerCase()}
					</p>
				</div>
			</div>

			<Tabs defaultValue="pending" className="mt-6">
				<TabsList>
					<TabsTrigger value="pending">
						{t("pending")} ({pending.length})
					</TabsTrigger>
					<TabsTrigger value="watched">
						{t("watched")} ({watchedItems.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="pending">
					{pending.length === 0 ? (
						<EmptyState
							icon={<BookmarkPlus className="h-7 w-7" />}
							title={t("empty")}
							description="Agregá películas para verlas más tarde."
							action={
								<Link to="/search">
									<Button>{t("emptyCta")}</Button>
								</Link>
							}
						/>
					) : (
						<>
							<p className="mb-3 mt-4 text-sm text-text-muted">{t("swipeHint")}</p>
							<motion.ul layout className="space-y-3">
								<AnimatePresence initial={false}>
									{pending.map((item) => (
										<WatchlistRow
											key={item.id}
											item={item}
											onWatched={() => markWatched(item.id, true)}
											onRemove={() => remove(item.id)}
										/>
									))}
								</AnimatePresence>
							</motion.ul>
						</>
					)}
				</TabsContent>

				<TabsContent value="watched">
					{watchedItems.length === 0 ? (
						<EmptyState
							icon={<Eye className="h-7 w-7" />}
							title="Todavía no marcaste ninguna como vista"
							description="Las películas que marques como vistas aparecerán acá."
						/>
					) : (
						<motion.div layout className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
							<AnimatePresence initial={false}>
								{watchedItems.map((item) => (
									<WatchedCard
										key={item.id}
										item={item}
										onPending={() => markWatched(item.id, false)}
										onRemove={() => remove(item.id)}
									/>
								))}
							</AnimatePresence>
						</motion.div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function WatchedCard({
	item,
	onPending,
	onRemove,
}: {
	item: IWatchlistItem;
	onPending: () => void;
	onRemove: () => void;
}) {
	return (
		<motion.div
			layout
			exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
			className="group overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card"
		>
			<div className="relative aspect-[2/3] overflow-hidden">
				<img
					src={getPosterUrl(item.movie.poster_path, "w500")}
					alt={item.movie.title}
					className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
				<p className="absolute bottom-2 left-3 right-3 line-clamp-1 text-sm font-semibold text-white">
					{item.movie.title}
				</p>
			</div>
			<div className="flex items-center gap-1.5 p-2">
				<button
					type="button"
					onClick={onPending}
					aria-label="Marcar como pendiente"
					title="Marcar como pendiente"
					className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-subtle py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
				>
					<EyeOff className="h-3.5 w-3.5" />
					Pendiente
				</button>
				<button
					type="button"
					onClick={onRemove}
					aria-label="Quitar de la watchlist"
					title="Quitar de la watchlist"
					className="flex h-8 w-9 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-danger/50 hover:text-danger"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
		</motion.div>
	);
}
