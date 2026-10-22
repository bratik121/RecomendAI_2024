import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { userLogout } from "@/src/redux/actions";
import { cn } from "@/src/lib/utils";
import { Avatar } from "@/src/components/Avatar";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { LanguageSwitcher } from "@/src/components/LanguageSwitcher";
import { Button } from "@/src/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import logo from "@/src/assets/logo-removebg-preview.png";

export function Header() {
	const { t } = useTranslation("nav");
	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.user
	);
	const pendingCount = useSelector(
		(state: RootState) => state.watchlist.summary.pending
	);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const navItems = [
		{ to: "/search", label: t("discover"), match: "/search", auth: false },
		{ to: "/review-films", label: t("reviewFilms"), match: "/review-films", auth: true },
		{ to: "/watchlist", label: t("watchlist"), match: "/watchlist", auth: true, badge: pendingCount },
		{ to: "/profile", label: t("profile"), match: "/profile", auth: true },
	].filter((item) => !item.auth || isAuthenticated);

	const handleLogout = () => dispatch(userLogout());

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 hidden h-16 transition-all duration-300 lg:block",
				scrolled
					? "border-b border-border-subtle bg-background/85 backdrop-blur-md"
					: "border-b border-transparent bg-transparent"
			)}
		>
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6">
				<Link to="/" className="group flex items-center gap-2">
					<img src={logo} alt="" className="h-9 w-9 object-contain" />
					<span className="text-lg font-extrabold tracking-tight text-text-primary transition-colors group-hover:text-accent">
						What2Watch
					</span>
				</Link>

				<nav className="flex items-center gap-1">
					{navItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className={cn(
								"relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
								location.pathname.includes(item.match)
									? "text-accent"
									: "text-text-secondary hover:text-text-primary"
							)}
						>
							{item.label}
							{"badge" in item && item.badge! > 0 && (
								<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
									{item.badge}
								</span>
							)}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-1.5">
					<ThemeToggle />
					<LanguageSwitcher />

					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<Avatar
										name={user.name ? `${user.name} ${user.lastname}` : "?"}
										src={user.avatar}
										size={34}
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuLabel>
									{user.name} {user.lastname}
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => navigate("/profile")}>
									<User /> {t("profile")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-danger focus:text-danger"
								>
									<LogOut /> {t("logout")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button variant="ghost" size="sm" onClick={() => navigate("/sign/in")}>
								{t("signIn")}
							</Button>
							<Button size="sm" onClick={() => navigate("/sign/up")}>
								{t("signUp")}
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
