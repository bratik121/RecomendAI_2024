import { PropsWithChildren } from "react";
import { Outlet, Navigate } from "react-router-dom";

type Props = PropsWithChildren<{
	isAuthenticated: boolean;
	redirectPath?: string;
}>;

/**
 * ProtectedRoutes
 * @param {boolean} isAuthenticated - condicion para renderizar el componente
 * @param {string} redirectPath - path al que se redirige si isAuthenticated es false
 * @param {string} message - mensaje que se muestra en el modal si isAuthenticated es false
 * @param {ReactNode} children - children que se renderizan si isAuthenticated es true
 * @returns {ReactNode} - children o Navigate
 * */

function ProtectedRoutes({
	isAuthenticated,
	children,
	redirectPath = "/",
}: Props) {
	if (!isAuthenticated) {
		return <Navigate to={redirectPath} />;
	}
	return children ? children : <Outlet />;
}

export default ProtectedRoutes;
