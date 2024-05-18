import MyRoutes from "./routes/MyRoutes";
import Nav from "./components/Nav/Nav";
import { useEffect } from "react";
import { storage } from "./helpers";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUserFromStorage } from "./redux/actions";
import { useEffect } from "react";
import { storage } from "./helpers";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setUserFromStorage } from "./redux/actions";
import { RootState } from "./redux/reducers";

function App() {
	const location = useLocation();
	const dispatch = useDispatch();
	const dispatch = useDispatch();
	const isOnSignPage = location.pathname.includes("sign");
	const { isAuthenticated } = useSelector((state: RootState) => state.user);

	useEffect(() => {
		const user = storage.get("user");
		if (user && !isAuthenticated) {
			const objectUser = JSON.parse(user);
			dispatch(setUserFromStorage(objectUser));
		}
	}, []);


	useEffect(() => {
		const user = storage.get("user");
		if (user && !isAuthenticated) {
			const objectUser = JSON.parse(user);
			dispatch(setUserFromStorage(objectUser));
		}
	}, []);

	return (
		<div className="w-screen max-w-screen overflow-x-hidden bg-pattern min-h-screen bg-c_dark_blue-600 text-white page-background relative z-10">
			{/* <div className="color"></div> */}
			{!isOnSignPage && <Nav />}
			<main
				className={`${
					!isOnSignPage && "mt-[72px]"
				}   max-w-full overflow-x-hidden  `}
				}   max-w-full overflow-x-hidden  `}
			>
				<MyRoutes isAuthenticated={isAuthenticated} />
			</main>
		</div>
	);
}

export default App;
