type Props = {
	fill?: boolean;
	onClick?: () => void;
	text: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	disabled?: boolean;
	title?: string;
	type?: "button" | "submit" | "reset";
	textSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
};

const getTextSize: Record<string, string> = {
	sm: "text-sm",
	md: "text-md",
	lg: "text-lg",
	xl: "text-xl",
	"2xl": "text-2xl",
	"3xl": "text-3xl",
	"4xl": "text-4xl",
};

const getStyle = (fill: boolean, disabled: boolean): string => {
	return fill
		? disabled
			? "bg-primary-200 text-c_gray-25 border border-primary-200"
			: "bg-primary-600 hover:bg-primary-400  text-c_gray-25 border border-primary-600"
		: disabled
		? "text-primary-200 border-primary-200 border border-primary-200"
		: "border-primary-600 hover:border-primary-400  text-primary-600 hover:text-primary-400  bg-c_dark_blue-600 hover:bg-c_dark_blue-400";
};
const Button = (props: Props) => {
	const {
		fill = true,
		onClick,
		text,
		leftIcon,
		rightIcon,
		disabled = false,
		type = "button",
		textSize = "sm",
		title,
	} = props;
	// const iconStyle = fill ? "text-c_gray-25" : "text-primary-600";
	return (
		<button
			className={`flex min-w-fit w-full items-center justify-center gap-2  rounded-lg  border
       px-4 py-[10px] transition duration-200 ease-in-out cursor-pointer ${getStyle(
					fill,
					disabled
				)}`}
			title={title}
			onClick={onClick}
			disabled={disabled}
			type={type}
		>
			{leftIcon && <div className="w-fit max-w-[20%]">{leftIcon}</div>}
			<div
				className={`w-fit max-w-full ${getTextSize[textSize]} font-semibold`}
			>
				{text}
			</div>
			{rightIcon && (
				<div className="flex w-fit max-w-[20%] justify-end">{rightIcon}</div>
			)}
		</button>
	);
};

export default Button;
