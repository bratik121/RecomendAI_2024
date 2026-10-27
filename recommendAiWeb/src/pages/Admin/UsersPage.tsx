import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Pencil, Plus, Search, ShieldCheck } from "lucide-react";
import { adminApi, adminErrorMessage, AdminUser, Paginated, UserRole } from "@/src/api/admin";
import { RootState } from "@/src/redux/reducers";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select } from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/EmptyState";
import { Avatar } from "@/src/components/Avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
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

type UserFormState = {
	email: string;
	name: string;
	lastname: string;
	bio: string;
	password: string;
};

const emptyUser: UserFormState = { email: "", name: "", lastname: "", bio: "", password: "" };

const roleBadge: Record<UserRole, { variant: "default" | "success" | "secondary"; label: string }> = {
	root: { variant: "default", label: "Root" },
	admin: { variant: "success", label: "Admin" },
	user: { variant: "secondary", label: "User" },
};

export default function UsersPage() {
	const { t } = useTranslation("admin");
	const currentUser = useSelector((state: RootState) => state.user.user);
	const isRoot = currentUser.role === "root";

	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [data, setData] = useState<Paginated<AdminUser> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<AdminUser | null>(null);
	const [form, setForm] = useState<UserFormState>(emptyUser);
	const [saving, setSaving] = useState(false);

	const [deactivating, setDeactivating] = useState<AdminUser | null>(null);
	const [changingRole, setChangingRole] = useState<AdminUser | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const res = await adminApi.listUsers({
				search: search || undefined,
				role: roleFilter === "all" ? undefined : (roleFilter as UserRole),
				page,
			});
			setData(res);
		} catch (err) {
			setError(adminErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, [search, roleFilter, page]);

	useEffect(() => {
		load();
	}, [load]);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyUser);
		setDialogOpen(true);
	};

	const openEdit = (user: AdminUser) => {
		setEditing(user);
		setForm({
			email: user.email,
			name: user.name,
			lastname: user.lastname,
			bio: user.bio || "",
			password: "",
		});
		setDialogOpen(true);
	};

	const submit = async () => {
		setSaving(true);
		try {
			if (editing) {
				await adminApi.updateUser(editing.id, {
					email: form.email,
					name: form.name,
					lastname: form.lastname,
					bio: form.bio,
					password: form.password || undefined,
				});
				toast.success(t("users.updated"));
			} else {
				await adminApi.createUser({
					email: form.email,
					name: form.name,
					lastname: form.lastname,
					bio: form.bio,
					password: form.password,
				});
				toast.success(t("users.created"));
			}
			setDialogOpen(false);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const confirmDeactivate = async () => {
		if (!deactivating) return;
		try {
			await adminApi.deactivateUser(deactivating.id);
			toast.success(t("users.deactivated"));
			setDeactivating(null);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	const activate = async (user: AdminUser) => {
		try {
			await adminApi.activateUser(user.id);
			toast.success(t("users.activated"));
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	const applyRole = async (role: UserRole) => {
		if (!changingRole) return;
		try {
			await adminApi.setRole(changingRole.id, role);
			toast.success(t("users.roleChanged"));
			setChangingRole(null);
			load();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		}
	};

	const canManage = (user: AdminUser) => {
		if (user.id === Number(currentUser.id)) return false;
		if (isRoot) return true;
		return user.role === "user";
	};

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
					{t("users.title")}
				</h1>
				<Button onClick={openCreate}>
					<Plus className="h-4 w-4" /> {t("users.create")}
				</Button>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
					<Input
						value={search}
						onChange={(e) => { setSearch(e.target.value); setPage(1); }}
						placeholder={t("users.search")}
						className="pl-9"
					/>
				</div>
				<div className="w-full sm:w-44">
					<Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
						<option value="all">{t("users.allRoles")}</option>
						<option value="root">{t("users.role.root")}</option>
						<option value="admin">{t("users.role.admin")}</option>
						<option value="user">{t("users.role.user")}</option>
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
				<EmptyState title={t("users.title")} description={t("users.empty")} />
			) : (
				<div className="rounded-2xl border border-border-subtle bg-surface shadow-card">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("users.columns.user")}</TableHead>
								<TableHead>{t("users.columns.email")}</TableHead>
								<TableHead>{t("users.columns.role")}</TableHead>
								<TableHead>{t("users.columns.status")}</TableHead>
								<TableHead className="text-right">{t("users.edit")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.results.map((user) => {
								const badge = roleBadge[user.role] || roleBadge.user;
								return (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar name={`${user.name} ${user.lastname}`} src={user.avatar} size={30} />
												<span className="font-semibold">
													{user.name} {user.lastname}
												</span>
											</div>
										</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge variant={badge.variant}>{t(`users.role.${user.role}`)}</Badge>
										</TableCell>
										<TableCell>
											{user.is_active ? (
												<Badge variant="success">{t("users.status.active")}</Badge>
											) : (
												<Badge variant="danger">{t("users.status.inactive")}</Badge>
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												{canManage(user) && (
													<>
														{isRoot && (
															<Button
																variant="ghost"
																size="icon"
																onClick={() => setChangingRole(user)}
																aria-label={t("users.confirmSetRole")}
															>
																<ShieldCheck className="h-4 w-4" />
															</Button>
														)}
														<Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={t("users.edit")}>
															<Pencil className="h-4 w-4" />
														</Button>
														{user.is_active ? (
															<Button
																variant="ghost"
																size="icon"
																className="text-danger hover:text-danger"
																onClick={() => setDeactivating(user)}
																aria-label={t("users.deactivate")}
															>
																<Plus className="h-4 w-4 rotate-45" />
															</Button>
														) : (
															<Button variant="ghost" size="icon" onClick={() => activate(user)} aria-label={t("users.activate")}>
																<ShieldCheck className="h-4 w-4" />
															</Button>
														)}
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}

			{data && data.count > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-text-muted">
						{data.count} {t("users.title").toLowerCase()}
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

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editing ? t("users.edit") : t("users.create")}</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label htmlFor="u-name">{t("users.field.name")}</Label>
								<Input id="u-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="u-last">{t("users.field.lastname")}</Label>
								<Input id="u-last" value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} />
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="u-email">{t("users.field.email")}</Label>
							<Input id="u-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="u-password">{t("users.field.password")}</Label>
							<Input
								id="u-password"
								type="password"
								value={form.password}
								placeholder={editing ? t("users.passwordHint") : ""}
								onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="u-bio">{t("users.field.bio")}</Label>
							<Input id="u-bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
						</div>
					</div>
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							{t("users.cancel")}
						</Button>
						<Button onClick={submit} disabled={saving}>
							{t("users.save")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog open={Boolean(deactivating)} onOpenChange={(open) => !open && setDeactivating(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("users.confirmDeactivate")}</AlertDialogTitle>
						<AlertDialogDescription>{t("users.confirmDeactivateDesc")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("users.cancel")}</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeactivate}>{t("users.deactivate")}</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={Boolean(changingRole)} onOpenChange={(open) => !open && setChangingRole(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t("users.confirmSetRole")}</AlertDialogTitle>
						<AlertDialogDescription>{t("users.confirmSetRoleDesc")}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t("users.cancel")}</AlertDialogCancel>
						{(["admin", "user"] as UserRole[]).map((role) => (
							<AlertDialogAction key={role} onClick={() => applyRole(role)}>
								{t(`users.role.${role}`)}
							</AlertDialogAction>
						))}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
