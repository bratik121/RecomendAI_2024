import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/src/lib/toast";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import {
	adminApi,
	adminErrorMessage,
	AdminMovie,
	Paginated,
} from "@/src/api/admin";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/EmptyState";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/src/components/ui/dialog";
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
import { Select } from "@/src/components/ui";

type MovieFormState = {
	title: string;
	release_year: string;
	overview: string;
	poster_path: string;
	genres: string;
	popularity: string;
	vote_average: string;
	revenue: string;
};

const emptyForm: MovieFormState = {
	title: "",
	release_year: "",
	overview: "",
	poster_path: "",
	genres: "",
	popularity: "0",
	vote_average: "0",
	revenue: "0",
};

function toForm(movie?: AdminMovie): MovieFormState {
	if (!movie) return emptyForm;
	return {
		title: movie.title,
		release_year: movie.release_year,
		overview: movie.overview,
		poster_path: movie.poster_path || "",
		genres: (movie.genres || []).join(", "),
		popularity: String(movie.popularity),
		vote_average: String(movie.vote_average),
		revenue: String(movie.revenue),
	};
}

export default function MoviesPage() {
	const { t } = useTranslation("admin");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [data, setData] = useState<Paginated<AdminMovie> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<AdminMovie | null>(null);
	const [form, setForm] = useState<MovieFormState>(emptyForm);
	const [posterFile, setPosterFile] = useState<File | null>(null);
	const [saving, setSaving] = useState(false);

	const [archiving, setArchiving] = useState<AdminMovie | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const res = await adminApi.listMovies({
				search: search || undefined,
				active: status === "all" ? undefined : status === "active",
				page,
			});
			setData(res);
		} catch (err) {
			setError(adminErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [search, status, page]);

	useEffect(() => {
		load();
	}, [load]);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm);
		setPosterFile(null);
		setDialogOpen(true);
	};

	const openEdit = (movie: AdminMovie) => {
		setEditing(movie);
		setForm(toForm(movie));
		setPosterFile(null);
		setDialogOpen(true);
	};

	const submit = async () => {
		setSaving(true);
		try {
			const payload = {
				title: form.title,
				release_year: form.release_year,
				overview: form.overview,
				poster_path: form.poster_path,
				genres: form.genres
					.split(",")
					.map((g) => g.trim())
					.filter(Boolean),
				popularity: Number(form.popularity || 0),
				vote_average: Number(form.vote_average || 0),
				revenue: Number(form.revenue || 0),
				poster_image: posterFile,
			};
			if (editing) {
				await adminApi.updateMovie(editing.id, payload);
				toast.success(t("movies.updated"));
			} else {
				await adminApi.createMovie(payload);
				toast.success(t("movies.created"));
			}
			setDialogOpen(false);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const confirmArchive = async () => {
		if (!archiving) return;
		try {
			await adminApi.archiveMovie(archiving.id);
			toast.success(t("movies.archived"));
			setArchiving(null);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	const restore = async (movie: AdminMovie) => {
		try {
			await adminApi.restoreMovie(movie.id);
			toast.success(t("movies.restored"));
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	const set =
		(key: keyof MovieFormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
					{t("movies.title")}
				</h1>
				<Button onClick={openCreate}>
					<Plus className="h-4 w-4" /> {t("movies.create")}
				</Button>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
					<Input
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						placeholder={t("movies.search")}
						className="pl-9"
					/>
				</div>
				<div className="w-full sm:w-44">
					<Select
						value={status}
						onChange={(e) => {
							setStatus(e.target.value);
							setPage(1);
						}}
						placeholder={t("movies.all")}
					>
						<option value="all">{t("movies.all")}</option>
						<option value="active">{t("movies.active")}</option>
						<option value="archived">{t("movies.archived")}</option>
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
				<EmptyState title={t("movies.title")} description={t("movies.empty")} />
			) : (
				<div className="rounded-2xl border border-border-subtle bg-surface shadow-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("movies.columns.title")}</TableHead>
								<TableHead>{t("movies.columns.year")}</TableHead>
								<TableHead>{t("movies.columns.rating")}</TableHead>
								<TableHead>{t("movies.columns.genres")}</TableHead>
								<TableHead>{t("movies.columns.status")}</TableHead>
								<TableHead className="text-right">{t("movies.edit")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.results.map((movie) => (
								<TableRow key={movie.id}>
									<TableCell className="font-semibold">{movie.title}</TableCell>
									<TableCell>{movie.release_year}</TableCell>
									<TableCell>{movie.vote_average}</TableCell>
									<TableCell>
										<div className="flex max-w-xs flex-wrap gap-1">
											{(movie.genres || []).slice(0, 3).map((genre) => (
												<Badge key={genre} variant="secondary">
													{genre}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>
										{movie.is_active ? (
											<Badge variant="success">{t("movies.active")}</Badge>
										) : (
											<Badge variant="danger">{t("movies.archived")}</Badge>
										)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEdit(movie)}
												aria-label={t("movies.edit")}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											{movie.is_active ? (
												<Button
													variant="ghost"
													size="icon"
													className="text-danger hover:text-danger"
													onClick={() => setArchiving(movie)}
													aria-label={t("movies.archive")}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											) : (
												<Button
													variant="ghost"
													size="icon"
													onClick={() => restore(movie)}
													aria-label={t("movies.restore")}
												>
													<RotateCcw className="h-4 w-4" />
												</Button>
											)}
										</div>
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
						{data.count} {t("movies.title").toLowerCase()}
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!data.previous}
							onClick={() => setPage((p) => p - 1)}
						>
							{t("actions.previous")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!data.next}
							onClick={() => setPage((p) => p + 1)}
						>
							{t("actions.next")}
						</Button>
					</div>
				</div>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editing ? t("movies.edit") : t("movies.create")}
						</DialogTitle>
						<DialogDescription>
							{editing && editing.poster_image ? t("movies.posterLocked") : ""}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="m-title">{t("movies.field.title")}</Label>
							<Input id="m-title" value={form.title} onChange={set("title")} />
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="m-year">{t("movies.field.releaseYear")}</Label>
								<Input
									id="m-year"
									value={form.release_year}
									onChange={set("release_year")}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="m-rating">
									{t("movies.field.voteAverage")}
								</Label>
								<Input
									id="m-rating"
									type="number"
									step="0.1"
									value={form.vote_average}
									onChange={set("vote_average")}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="m-overview">{t("movies.field.overview")}</Label>
							<textarea
								id="m-overview"
								value={form.overview}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, overview: e.target.value }))
								}
								rows={3}
								className="w-full resize-y rounded-lg border border-border-subtle bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/60"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="m-pop">{t("movies.field.popularity")}</Label>
								<Input
									id="m-pop"
									type="number"
									step="0.1"
									value={form.popularity}
									onChange={set("popularity")}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="m-rev">{t("movies.field.revenue")}</Label>
								<Input
									id="m-rev"
									type="number"
									step="0.1"
									value={form.revenue}
									onChange={set("revenue")}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="m-genres">{t("movies.field.genres")}</Label>
							<Input
								id="m-genres"
								value={form.genres}
								onChange={set("genres")}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="m-path">{t("movies.field.posterPath")}</Label>
							<Input
								id="m-path"
								value={form.poster_path}
								onChange={set("poster_path")}
							/>
						</div>
						{!editing?.poster_image && (
							<div className="space-y-1.5">
								<Label htmlFor="m-poster">{t("movies.field.poster")}</Label>
								<Input
									id="m-poster"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
								/>
							</div>
						)}
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							{t("movies.cancel")}
						</Button>
						<Button onClick={submit} disabled={saving}>
							{t("movies.save")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={Boolean(archiving)}
				onOpenChange={(open) => !open && setArchiving(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("movies.confirmArchive")}</AlertDialogTitle>
						<AlertDialogDescription>
							{t("movies.confirmArchiveDesc")}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("movies.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmArchive}>
							{t("movies.archive")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
