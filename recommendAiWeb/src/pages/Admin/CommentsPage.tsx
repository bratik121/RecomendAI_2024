import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/src/lib/toast";
import { Search, Trash2 } from "lucide-react";
import { adminApi, adminErrorMessage, AdminComment, Paginated } from "@/src/api/admin";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select } from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/EmptyState";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/src/components/ui/table";

export default function CommentsPage() {
	const { t } = useTranslation("admin");
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [data, setData] = useState<Paginated<AdminComment> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [moderating, setModerating] = useState<AdminComment | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const res = await adminApi.listComments({
				search: search || undefined,
				is_deleted: filter === "all" ? undefined : filter === "deleted",
				page,
			});
			setData(res);
		} catch (err) {
			setError(adminErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [search, filter, page]);

	useEffect(() => {
		load();
	}, [load]);

	const confirmModerate = async () => {
		if (!moderating) return;
		try {
			await adminApi.moderateComment(moderating.id);
			toast.success(t("comments.moderated"));
			setModerating(null);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	return (
		<div className="space-y-5">
			<h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
				{t("comments.title")}
			</h1>

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
					<Input
						value={search}
						onChange={(e) => { setSearch(e.target.value); setPage(1); }}
						placeholder={t("comments.search")}
						className="pl-9"
					/>
				</div>
				<div className="w-full sm:w-44">
					<Select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
						<option value="all">{t("comments.all")}</option>
						<option value="active">{t("comments.activeOnly")}</option>
						<option value="deleted">{t("comments.deletedOnly")}</option>
					</Select>
				</div>
			</div>

			{error && <p className="text-sm text-danger">{error}</p>}

			{loading ? (
				<div className="space-y-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-12 rounded-xl" />
					))}
				</div>
			) : !data || data.results.length === 0 ? (
				<EmptyState title={t("comments.title")} description={t("comments.empty")} />
			) : (
				<div className="rounded-2xl border border-border-subtle bg-surface shadow-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("comments.columns.user")}</TableHead>
								<TableHead>{t("comments.columns.body")}</TableHead>
								<TableHead>{t("comments.columns.status")}</TableHead>
								<TableHead className="text-right">{t("comments.moderate")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.results.map((comment) => (
								<TableRow key={comment.id}>
									<TableCell className="whitespace-nowrap font-medium">
										{comment.user?.name} {comment.user?.lastname}
									</TableCell>
									<TableCell className="max-w-md">
										<p className={comment.is_deleted ? "italic text-text-muted" : ""}>
											{comment.is_deleted ? "—" : comment.body}
										</p>
									</TableCell>
									<TableCell>
										{comment.is_deleted ? (
											<Badge variant="danger">{t("comments.deletedOnly")}</Badge>
										) : (
											<Badge variant="success">{t("comments.activeOnly")}</Badge>
										)}
									</TableCell>
									<TableCell className="text-right">
										{!comment.is_deleted && (
											<Button
												variant="ghost"
												size="icon"
												className="text-danger hover:text-danger"
												onClick={() => setModerating(comment)}
												aria-label={t("comments.moderate")}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{data && data.count > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-text-muted">
						{data.count} {t("comments.title").toLowerCase()}
					</p>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>
							{t("actions.previous")}
						</Button>
						<Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
							{t("actions.next")}
						</Button>
					</div>
				</div>
			)}

			<AlertDialog open={Boolean(moderating)} onOpenChange={(open) => !open && setModerating(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("comments.confirmModerate")}</AlertDialogTitle>
						<AlertDialogDescription>{t("comments.confirmModerateDesc")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("users.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmModerate}>{t("comments.moderate")}</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
