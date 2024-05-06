import MyRoutes from "./routes/MyRoutes";
import Nav from "./components/Nav/Nav";
import { useEffect } from "react";
import { storage } from "./helpers";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "./redux/reducers";

function App() {
	const location = useLocation();
	const isOnSignPage = location.pathname.includes("sign");
	const { isAuthenticated } = useSelector((state: RootState) => state.user);

	useEffect(() => {
		const user = storage.get("user");
		console.log("user", user);
	}, []);

	return (
		<div className="w-screen max-w-screen overflow-x-hidden bg-pattern min-h-screen bg-c_dark_blue-600 text-white page-background relative">
			<div className="color"></div>
			{/* <div className="color-2"></div> */}
			{!isOnSignPage && <Nav />}
			<main
				className={`${
					!isOnSignPage && "mt-[72px]"
				}  relative max-w-full overflow-x-hidden`}
			>
				<MyRoutes isAuthenticated={isAuthenticated} />
			</main>
		</div>
	);
}

export default App;
