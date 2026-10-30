import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "@/src/redux/reducers";

/**
 * AdminRoute
 * Restringe el acceso a las rutas de administración a usuarios con rol
 * `admin` o `root`. Si no cumple, redirige al home.
 */
export default function AdminRoute() {
	const { isAuthenticated, user } = useSelector((state: RootState) => state.user);
	const isAdmin = user.role === "admin" || user.role === "root";

	if (!isAuthenticated) {
		return <Navigate to="/sign/in" replace />;
	}
	if (!isAdmin) {
		return <Navigate to="/" replace />;
	}
	return <Outlet />;
}
