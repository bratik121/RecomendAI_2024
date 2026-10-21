import { AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { Landingpage, MovieDetail, Sign, ReviewFilms, Searchpage } from "../pages";
import ProtectedRoutes from "../components/protectedRoutes/protectedRoutes";
type Props = {
	isAuthenticated: boolean;
};

const MyRoutes = ({ isAuthenticated }: Props) => {
	return (
		<AnimatePresence>
			<Routes>
				<Route path="/" element={<Landingpage />} />
				<Route path="/sign/*" element={<Sign />} />
				<Route path="/search" element={<Searchpage />} />
				<Route path="/movie/:id" element={<MovieDetail />} />

				{/* Rutas publicas */}
				{/* Rutas progetigas por autenticacion  */}
				<Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
					<Route path="/review-films" element={<ReviewFilms />} />
				</Route>
			</Routes>
		</AnimatePresence>
	);
};
export default MyRoutes;
