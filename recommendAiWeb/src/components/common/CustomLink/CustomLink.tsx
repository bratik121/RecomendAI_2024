import { Link } from "react-router-dom";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	text?: string;
	to: string;
	onClick?: (e?: any) => void;
	className?: string;
	style?: React.CSSProperties;
}>;

const CustomLink = ({ children, to, onClick, className, style }: Props) => {
	const scrollTop = () => {
		window.scrollTo({ top: 0, behavior: "auto" });
	};
	const handleClick = () => {
		onClick && onClick();
		scrollTop();
	};
	return (
		<Link to={to} onClick={handleClick} className={className} style={style}>
			{children}
		</Link>
	);
};
export default CustomLink;
