const BurguerButton = ({
	active,
	toggleState,
}: {
	active: boolean;
	toggleState: () => void;
}) => {
	return (
		<div
			className={`aspect-square w-7 flex just items-center ${
				active ? "" : ""
			} lg:hidden transition-all duration-500 ease-in- overflow-hidden z-50`}
			onClick={toggleState}
		>
			<div className={`btn-burger ${active ? "open" : ""} `}></div>
		</div>
	);
};

export default BurguerButton;
