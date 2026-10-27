import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { BarChart3, Film, Menu, MessageSquare, Users, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { RootState } from "@/src/redux/reducers";
import { Avatar } from "@/src/components/Avatar";

const items = [
	{ to: "/admin", label: "metrics", icon: BarChart3, end: true },
	{ to: "/admin/movies", label: "movies", icon: Film, end: false },
	{ to: "/admin/users", label: "users", icon: Users, end: false },
	{ to: "/admin/comments", label: "comments", icon: MessageSquare, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const { t } = useTranslation("admin");
	return (
		<nav aria-label="Administración" className="flex flex-col gap-1 p-3">
			{items.map(({ to, label, icon: Icon, end }) => (
				<NavLink
					key={to}
					to={to}
					end={end}
					onClick={onNavigate}
					className={({ isActive }) =>
						cn(
							"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							isActive
								? "bg-accent-soft text-accent"
								: "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
						)
					}
				>
					<Icon className="h-5 w-5" aria-hidden />
					{t(`nav.${label}`)}
				</NavLink>
			))}
		</nav>
	);
}

export function AdminLayout() {
	const { t } = useTranslation("admin");
	const { user } = useSelector((state: RootState) => state.user);
	const [open, setOpen] = useState(false);

	return (
		<div className="flex min-h-screen w-full bg-background">
			{/* Sidebar desktop */}
			<aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border-subtle bg-surface lg:block">
				<div className="flex h-16 items-center gap-2 border-b border-border-subtle px-5">
					<span className="text-lg font-extrabold text-text-primary">
						{t("title")}
					</span>
				</div>
				<SidebarContent />
			</aside>

			{/* Sidebar mobile */}
			{open && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-black/60"
						onClick={() => setOpen(false)}
						aria-hidden
					/>
					<aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-float">
						<div className="flex h-16 items-center justify-between border-b border-border-subtle px-5">
							<span className="text-lg font-extrabold text-text-primary">
								{t("title")}
							</span>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label="Cerrar menú"
								className="rounded-md p-1.5 text-text-secondary hover:bg-surface-elevated"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
						<SidebarContent onNavigate={() => setOpen(false)} />
					</aside>
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col">
				{/* Topbar */}
				<header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-background/85 px-4 backdrop-blur-md sm:px-6">
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="rounded-md p-2 text-text-secondary hover:bg-surface-elevated lg:hidden"
						aria-label="Abrir menú"
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="text-sm font-medium text-text-muted">
						{t("subtitle")}
					</span>
					<div className="flex items-center gap-2">
						<span className="hidden text-sm font-medium text-text-secondary sm:inline">
							{user.name} {user.lastname}
						</span>
						<Avatar
							name={`${user.name} ${user.lastname}`}
							src={user.avatar}
							size={34}
						/>
					</div>
				</header>

				<main className="flex-1 p-4 sm:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
