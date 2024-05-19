import { AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { Landingpage, Sign, ReviewFilms } from "../pages";
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
				{/* Rutas progetigas por autenticacion  */}
				<Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
					<Route path="/review-films" element={<ReviewFilms />} />
				</Route>
			</Routes>
		</AnimatePresence>
	);
};
export default MyRoutes;
