import { AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { Landingpage, Sign } from "../pages";
import ProtectedRoutes from "../components/protectedRoutes/protectedRoutes";
type Props = {};

const MyRoutes = (props: Props) => {
	return (
		<AnimatePresence>
			<Routes>
				<Route path="/" element={<Landingpage />} />
				<Route path="/sign" element={<Sign />} />
			</Routes>
		</AnimatePresence>
	);
};
export default MyRoutes;
