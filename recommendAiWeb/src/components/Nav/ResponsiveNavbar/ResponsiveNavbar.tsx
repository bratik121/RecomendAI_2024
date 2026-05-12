import { useState } from "react";
import BurguerButton from "./BurguerButton";
import { CustomLink, Button } from "@/src/components/common";
import { BiLogOutCircle } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/reducers";
import { motion as m, AnimatePresence } from "framer-motion";
import logo from "@/src/assets/logo-removebg-preview.png";

import "./style.css";
import { userLogout } from "@/src/redux/actions";

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
			<div className="items-center justify-between flex w-full border-t border-white/10 pt-4 mt-2">
				<span className="text-white font-medium">{name}</span>
				<BiLogOutCircle
					className="text-primary-500 hover:text-red-500 transition-colors cursor-pointer text-3xl"
					onClick={handleLogout}
				/>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-stretch gap-y-3 w-full border-t border-white/10 pt-4 mt-2">
			<Button text="Sign In" onClick={handleSignin} />
			<Button text="Sign Up" onClick={handleSignup} fill={false} />
		</div>
	);
};

const ResponsiveNavbar = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.user
	);
	const toggleState = () => {
		setIsOpen(!isOpen);
	};

	const handleLogout = () => {
		dispatch(userLogout());
	};

	return (
		<div className="flex lg:hidden h-[72px] items-center justify-between px-6 z-50 fixed w-full bg-c_dark_blue-600/90 backdrop-blur-md border-b border-white/5">
			<CustomLink
				to="/"
				onClick={() => {
					setIsOpen(false);
				}}
			>
				<div className="flex items-center gap-x-2 cursor-pointer w-fit z-50 relative">
					<h2 className="text-white font-custom text-lg font-bold">What2Watch</h2>
					<div className="h-10 aspect-square">
						<img src={logo} alt="What2Watch Logo" className="object-contain" />
					</div>
				</div>
			</CustomLink>
			<BurguerButton active={isOpen} toggleState={toggleState} />
			<AnimatePresence>
				{isOpen && (
					<m.div
						className="flex flex-col gap-y-4 absolute top-[72px] left-0 w-full bg-c_dark_blue-600 border-b border-white/10 py-6 z-40 px-6 shadow-2xl"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
					>
						<CustomLink to="/search" onClick={toggleState}>
							<div className={`text-xl font-medium ${location.pathname.includes("search") ? "text-primary-400" : "text-white"}`}>
								Discover
							</div>
						</CustomLink>

						{isAuthenticated && (
							<CustomLink to="/review-films" onClick={toggleState}>
								<div className={`text-xl font-medium ${location.pathname.includes("review-films") ? "text-primary-400" : "text-white"}`}>
									Review Films
								</div>
							</CustomLink>
						)}

						<RenderAuth
							isAuthenticated={isAuthenticated}
							name={user.name + " " + user.lastname}
							handleLogout={handleLogout}
						/>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ResponsiveNavbar;
