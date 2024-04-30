import { useState, useEffect } from "react";
import { Button } from "../../common";
import logo from "@/src/assets/logo-removebg-preview.png";
import { useScroll, useTransform } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { BiLogOutCircle } from "react-icons/bi";
import { userLogout } from "@/src/redux/actions";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/src/redux/reducers";
import "./style.css";

const RenderAuth = ({
	isAuthenticated,
	name,
	handleLogout,
}: {
	isAuthenticated: boolean;
	name: string;
	handleLogout(): void;
}) => {
	const navigate = useNavigate();

	const handleSignin = () => {
		navigate("/sign/in");
	};

	const handleSignup = () => {
		navigate("/sign/up");
	};

	if (isAuthenticated) {
		return (
			<div className="items-center flex gap-x-2">
				<span>{name}</span>
				<BiLogOutCircle
					className="text-primary-600 hovertext-primary-400 cursor-pointer text-2xl"
					onClick={handleLogout}
				/>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-x-2">
			<Button text="Sign In" onClick={handleSignin} />
			<Button text="Sign Up" onClick={handleSignup} fill={false} />
		</div>
	);
};

const Header = () => {
	const dispatch = useDispatch();
	const { scrollYProgress } = useScroll();
	const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.user
	);

	const handleLogout = () => {
		console.log("Logging out");
		dispatch(userLogout());
	};

	// State to hold the current opacity value
	const [currentOpacity, setCurrentOpacity] = useState(0); // default initial opacity

	// Update the opacity state whenever the `opacity` MotionValue changes
	useEffect(() => {
		const unsubscribe = opacity.onChange((latestOpacity) => {
			setCurrentOpacity(latestOpacity);
		});

		// Cleanup function to unsubscribe from changes when the component unmounts
		return () => unsubscribe();
	}, [opacity]);

	return (
		<header className="hidden lg:block h-[72px] w-full fixed z-50">
			<div className=" top-0 left-0 flex items-center justify-between px-8 h-full w-full absolute z-40  ">
				{/* Logo */}
				<div className="flex items-center gap-x-2 cursor-pointer w-fit ">
					<h2 className="text-white font-custom font-semibold">What2Watch</h2>
					<div className="h-12 aspect-square">
						<img src={logo} alt="What2Watch Logo" />
					</div>
				</div>
				{/* Rest links and buttons */}
				<div>
					{/* links */}
					<ul className="flex items-center gap-x-4"></ul>
					{/* AuthUI */}
					<RenderAuth
						isAuthenticated={isAuthenticated}
						name={user.name + " " + user.lastname}
						handleLogout={handleLogout}
					/>
				</div>
			</div>
			<div
				className=" absolute top-0 w-full h-full z-30 bg-c_dark_blue-600 right-0"
				style={{ opacity: currentOpacity }}
			></div>
		</header>
	);
};

export default Header;
