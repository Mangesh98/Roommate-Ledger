import { useCookies } from "react-cookie";
import { Outlet, Navigate } from "react-router-dom";
export const ProtectedRoutes = () => {
	const [cookies] = useCookies(["token"]);
	const user = cookies.token;
	return user ? <Outlet /> : <Navigate to="/sign-in" />;
};
export const PublicRoute = () => {
	const [cookies] = useCookies(["token"]);
	const user = cookies.token;
	return user ? <Navigate to="/" /> : <Outlet />;
};
