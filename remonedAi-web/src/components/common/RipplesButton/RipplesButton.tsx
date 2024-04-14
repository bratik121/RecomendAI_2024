import "./style.css";

type RipplesButtonProps = {
	handleClick: () => void;
	text: string;
};

const RipplesButton = ({ handleClick, text }: RipplesButtonProps) => {
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
			className="ripple-button px-3 rounded-2xl py-1 md:-translate-x-3 w-fit "
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
