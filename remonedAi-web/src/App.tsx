import MyRoutes from "./routes/MyRoutes";
import Nav from "./components/Nav/Nav";

function App() {
	return (
		<div className="w-screen overflow-x-hidden bg-pattern min-h-screen bg-c_dark_blue-600 text-white page-background relative">
			<div className="color"></div>
			{/* <div className="color-2"></div> */}
			<Nav />
			<main className="mt-[72px] px-8 py-4 relative  ">
				<MyRoutes />
			</main>
		</div>
	);
}

export default App;
