import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import MyRoutes from "./routes/MyRoutes";
import { Nav } from "./components/Nav/Nav";
import { Toaster } from "./components/ui/sonner";
import { useTheme } from "./lib/theme";
import { storage } from "./helpers";
import { setUserFromStorage } from "./redux/actions";
import { RootState } from "./redux/reducers";
import { useWatchlist } from "./redux/hooks/useWatchlist";

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "auto" });
	}, [pathname]);
	return null;
}

/** Sonner toasts follow the app theme, not just the OS preference. */
function ThemedToaster() {
	const { theme } = useTheme();
	return <Toaster theme={theme} />;
}

function App() {
	const location = useLocation();
	const dispatch = useDispatch();
	const isOnSignPage = location.pathname.includes("sign");
	const { isAuthenticated } = useSelector((state: RootState) => state.user);
	const { refresh: refreshWatchlist } = useWatchlist();

	useEffect(() => {
		if (isAuthenticated) refreshWatchlist();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]);

	useEffect(() => {
		const user = storage.get("user");
		if (user && !isAuthenticated) {
			dispatch(setUserFromStorage(JSON.parse(user)));
		}
	}, [dispatch, isAuthenticated]);

	return (
		<MotionConfig reducedMotion="user">
			<ScrollToTop />
			<div className="min-h-screen w-full overflow-x-hidden bg-background text-text-primary">
				{!isOnSignPage && <Nav />}
				<main className={!isOnSignPage ? "pt-16" : ""}>
					<MyRoutes isAuthenticated={isAuthenticated} />
				</main>
				<ThemedToaster />
			</div>
		</MotionConfig>
	);
}

export default App;
