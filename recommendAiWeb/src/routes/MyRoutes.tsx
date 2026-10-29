import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import { Landingpage, MovieDetail, Sign, ReviewFilms, Searchpage, WatchlistPage, ProfilePage, AchievementsPage, NotFound } from "../pages";
import ProtectedRoutes from "../components/protectedRoutes/protectedRoutes";
import AdminRoute from "../components/admin/AdminRoute";
import { AdminLayout } from "../components/admin/AdminLayout";
import { MetricsDashboard, MoviesPage, UsersPage, CommentsPage } from "../pages/Admin";
import { pageTransition } from "@/src/lib/motion";

type Props = {
	isAuthenticated: boolean;
};

/** Wraps each route so navigation cross-fades between pages. */
function PageTransition({ children }: { children: React.ReactNode }) {
	return (
		<motion.div variants={pageTransition} initial="initial" animate="enter" exit="exit">
			{children}
		</motion.div>
	);
}

const MyRoutes = ({ isAuthenticated }: Props) => {
	const location = useLocation();

	return (
		<AnimatePresence mode="wait" initial={false}>
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<PageTransition><Landingpage /></PageTransition>} />
				<Route path="/sign/*" element={<PageTransition><Sign /></PageTransition>} />
				<Route path="/search" element={<PageTransition><Searchpage /></PageTransition>} />
				<Route path="/movie/:id" element={<PageTransition><MovieDetail /></PageTransition>} />

				<Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
					<Route path="/review-films" element={<PageTransition><ReviewFilms /></PageTransition>} />
					<Route path="/watchlist" element={<PageTransition><WatchlistPage /></PageTransition>} />
					<Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
					<Route path="/achievements" element={<PageTransition><AchievementsPage /></PageTransition>} />
				</Route>

				<Route element={<AdminRoute />}>
					<Route path="/admin" element={<AdminLayout />}>
						<Route index element={<MetricsDashboard />} />
						<Route path="movies" element={<MoviesPage />} />
						<Route path="users" element={<UsersPage />} />
						<Route path="comments" element={<CommentsPage />} />
					</Route>
				</Route>

				<Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
			</Routes>
		</AnimatePresence>
	);
};
export default MyRoutes;
