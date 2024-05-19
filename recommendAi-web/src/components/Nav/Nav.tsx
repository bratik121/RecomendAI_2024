import React from "react";
import { Header } from "./Header";
import { ResponsiveNavbar } from "./ResponsiveNavbar";
type Props = {};

const Nav = (props: Props) => {
	return (
		<div>
			<Header />
			<ResponsiveNavbar />
		</div>
	);
};

export default Nav;
