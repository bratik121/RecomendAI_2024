import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./i18n";
import "./index.css";

const USER_URL = `${import.meta.env.VITE_API_URL}/User/`;
console.log("USER_URL:", USER_URL);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<Provider store={store}>
			<Router>
				<App />
			</Router>
		</Provider>
	</React.StrictMode>
);
