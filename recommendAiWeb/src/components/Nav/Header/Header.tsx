import { useState, useEffect } from "react";
import { Button } from "../../common";
import logo from "@/src/assets/logo-removebg-preview.png";
import { useScroll, useTransform, motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { CustomLink } from "@/src/components/common";
import { BiLogOutCircle } from "react-icons/bi";
import { userLogout } from "@/src/redux/actions";
import { useNavigate, useLocation } from "react-router-dom";
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
			<div className="items-center flex gap-x-3 min-w-fit bg-c_dark_blue-600/50 px-4 py-2 rounded-full border border-c_dark_blue-400 backdrop-blur-sm">
				<span className="font-medium text-white">{name}</span>
				<BiLogOutCircle
					className="text-primary-500 hover:text-red-500 transition-colors cursor-pointer text-2xl"
					onClick={handleLogout}
					title="Logout"
				/>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-x-3">
			<Button text="Sign In" onClick={handleSignin} />
			<Button text="Sign Up" onClick={handleSignup} fill={false} />
		</div>
	);
};

const Header = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const { scrollYProgress } = useScroll();
	const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.user
	);

	const handleLogout = () => {
		dispatch(userLogout());
	};

	const [currentOpacity, setCurrentOpacity] = useState(0);
	useEffect(() => {
		setCurrentOpacity(0);
	}, [location.pathname]);

	useEffect(() => {
		const unsubscribe = opacity.onChange((latestOpacity) => {
			setCurrentOpacity(latestOpacity);
		});
		return () => unsubscribe();
	}, [opacity]);

	return (
		<header className="hidden lg:block h-[80px] w-full fixed z-50 transition-all duration-300">
			<div className="top-0 left-0 flex items-center justify-between px-16 h-full w-full absolute z-40">
				{/* Logo */}
				<CustomLink to="/" className="z-50 relative group">
					<div className="flex items-center gap-x-2 cursor-pointer w-fit">
						<h2 className="text-white font-custom text-xl font-bold tracking-tight group-hover:text-primary-400 transition-colors">What2Watch</h2>
						<div className="h-10 aspect-square">
							<img src={logo} alt="What2Watch Logo" className="object-contain" />
						</div>
					</div>
				</CustomLink>
				
				{/* Rest links and buttons */}
				<div className="flex items-center w-full justify-end lg:justify-between">
					{/* links */}
					<ul className="flex items-center justify-center gap-x-8 w-full">
						<CustomLink to="/search">
							<li className="relative group cursor-pointer">
								<span className={`text-lg font-medium transition-colors duration-200 ${location.pathname.includes("search") ? "text-primary-400" : "text-c_gray-200 group-hover:text-white"}`}>
									Discover
								</span>
								{location.pathname.includes("search") && (
									<motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
								)}
							</li>
						</CustomLink>
						{isAuthenticated && (
							<CustomLink to="/review-films">
								<li className="relative group cursor-pointer">
									<span className={`text-lg font-medium transition-colors duration-200 ${location.pathname.includes("review-films") ? "text-primary-400" : "text-c_gray-200 group-hover:text-white"}`}>
										Review Films
									</span>
									{location.pathname.includes("review-films") && (
										<motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
									)}
								</li>
							</CustomLink>
						)}
					</ul>
					
					{/* AuthUI */}
					<RenderAuth
						isAuthenticated={isAuthenticated}
						name={user.name + " " + user.lastname}
						handleLogout={handleLogout}
					/>
				</div>
			</div>
			{/* Blurred Background */}
			<div
				className="absolute top-0 w-full h-full z-30 bg-c_dark_blue-600/80 backdrop-blur-md border-b border-white/5"
				style={{ opacity: currentOpacity }}
			></div>
		</header>
	);
};

export default Header;
