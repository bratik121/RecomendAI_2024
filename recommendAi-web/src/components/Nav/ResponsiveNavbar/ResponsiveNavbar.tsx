import { useState } from "react";
import BurguerButton from "./BurguerButton";
import { CustomLink, Button } from "@/src/components/common";
import { BiLogOutCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
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
			<div className="items-center flex gap-x-2 min-w-fit">
				<span>{name}</span>
				<BiLogOutCircle
					className="text-primary-600 hovertext-primary-400 cursor-pointer text-2xl"
					onClick={handleLogout}
				/>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center gap-y-2">
			<Button text="Sign In" onClick={handleSignin} />
			<Button text="Sign Up" onClick={handleSignup} fill={false} />
		</div>
	);
};

const ResponsiveNavbar = () => {
	const dispatch = useDispatch();
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
		<div className="flex lg:hidden h-[72px] items-center justify-between px-8 z-50 fixed w-full bg-c_dark_blue-400">
			<CustomLink
				to="/"
				onClick={() => {
					setIsOpen(false);
				}}
			>
				<div className="flex items-center gap-x-2 cursor-pointer w-fit z-50 relative ">
					<h2 className="text-white font-custom font-semibold">What2Watch</h2>
					<div className="h-12 aspect-square">
						<img src={logo} alt="What2Watch Logo" />
					</div>
				</div>
			</CustomLink>
			<BurguerButton active={isOpen} toggleState={toggleState} />
			<AnimatePresence>
				{isOpen && (
					<m.div
						className={`flex flex-col gap-y-2 absolute top-16 left-0 w-full bg-c_dark_blue-400 py-4 z-40 px-8`}
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -30 }}
					>
						{isAuthenticated && (
							<CustomLink to="/review-films" onClick={toggleState}>
								<span className="text-white">Review films</span>
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
