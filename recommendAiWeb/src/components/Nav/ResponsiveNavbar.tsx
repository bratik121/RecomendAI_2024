import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { RootState } from "@/src/redux/reducers";
import { userLogout } from "@/src/redux/actions";
import { cn } from "@/src/lib/utils";
import { Avatar } from "@/src/components/Avatar";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { LanguageSwitcher } from "@/src/components/LanguageSwitcher";
import { Button } from "@/src/components/ui/button";
import logo from "@/src/assets/logo-removebg-preview.png";

export function ResponsiveNavbar() {
	const { t } = useTranslation("nav");
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.user
	);
	const pendingCount = useSelector(
		(state: RootState) => state.watchlist.summary.pending
	);

	const items = [
		{ to: "/search", label: t("discover"), match: "/search", auth: false },
		{ to: "/review-films", label: t("reviewFilms"), match: "/review-films", auth: true },
		{ to: "/watchlist", label: t("watchlist"), match: "/watchlist", auth: true, badge: pendingCount },
		{ to: "/profile", label: t("profile"), match: "/profile", auth: true },
		{ to: "/admin", label: t("admin"), match: "/admin", auth: true, admin: true },
	].filter(
		(item) =>
			(!item.auth || isAuthenticated) &&
			(!("admin" in item && item.admin) || (user.role === "admin" || user.role === "root"))
	);

	return (
		<header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border-subtle bg-background/85 px-4 backdrop-blur-md lg:hidden">
			<Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
				<img src={logo} alt="" className="h-8 w-8 object-contain" />
				<span className="text-lg font-extrabold tracking-tight text-text-primary">
					What2Watch
				</span>
			</Link>

			<div className="flex items-center gap-1">
				<ThemeToggle />
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-label={open ? "Cerrar menú" : "Abrir menú"}
					aria-expanded={open}
					className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary hover:bg-surface-elevated"
				>
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={open ? "x" : "menu"}
							initial={{ rotate: -90, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							exit={{ rotate: 90, opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="flex"
						>
							{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</motion.span>
					</AnimatePresence>
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<motion.nav
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
						className="absolute inset-x-0 top-16 overflow-hidden border-b border-border-subtle bg-background px-4 shadow-float"
					>
						<div className="flex flex-col gap-1 py-4">
							{items.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									onClick={() => setOpen(false)}
									className={cn(
										"flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold transition-colors",
										location.pathname.includes(item.match)
											? "bg-accent-soft text-accent"
											: "text-text-primary hover:bg-surface-elevated"
									)}
								>
									<span className="flex items-center gap-2">
										{item.label}
										{"badge" in item && item.badge! > 0 && (
											<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
												{item.badge}
											</span>
										)}
									</span>
								</Link>
							))}

							<div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-4">
								<LanguageSwitcher />
								{isAuthenticated && (
									<div className="flex items-center gap-2">
										<Avatar
											name={user.name ? `${user.name} ${user.lastname}` : "?"}
											src={user.avatar}
											size={32}
										/>
										<span className="text-sm font-medium text-text-primary">
											{user.name}
										</span>
									</div>
								)}
							</div>

							<div className="mt-3">
								{isAuthenticated ? (
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											setOpen(false);
											dispatch(userLogout());
										}}
									>
										<LogOut className="h-4 w-4" /> {t("logout")}
									</Button>
								) : (
									<div className="flex flex-col gap-2">
										<Button
											onClick={() => {
												setOpen(false);
												navigate("/sign/up");
											}}
										>
											{t("signUp")}
										</Button>
										<Button
											variant="outline"
											onClick={() => {
												setOpen(false);
												navigate("/sign/in");
											}}
										>
											{t("signIn")}
										</Button>
									</div>
								)}
							</div>
						</div>
					</motion.nav>
				)}
			</AnimatePresence>
		</header>
	);
}
