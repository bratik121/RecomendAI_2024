import "./style.css";

type RipplesButtonProps = {
	handleClick: () => void;
	text: string;
	className?: string;
};

const RipplesButton = ({
	handleClick,
	text,
	className,
}: RipplesButtonProps) => {
	const rippleEfect = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		let btn = e.target as HTMLButtonElement;
		let x = e.clientX - btn.offsetLeft;
		let y = e.clientY - btn.offsetTop;
		let ripples = document.createElement("span");
		ripples.classList.add("ripples");
		ripples.style.left = x + "px";
		ripples.style.top = y + "px";
		btn.appendChild(ripples);

		setTimeout(() => {
			ripples.remove();
		}, 1000);
	};
	return (
		<button
			className={`ripple-button px-3 rounded-lg py-1  w-fit ${className}`}
			onClick={(e) => {
				rippleEfect(e);
				handleClick();
			}}
		>
			{text}
		</button>
	);
};

export default RipplesButton;
