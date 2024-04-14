import React from "react";

type Props = {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	placeholder?: string;
	text?: string;
	type?: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	value?: string;
	disabled?: boolean;
	error?: string;
	message?: string;
	onClick?: () => void;
	onFocus?: () => void;
	name?: string;
	border?: boolean;
	className?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	showErrorMessage?: boolean;
};

const getPadding = (
	leftIcon: React.ReactNode,
	rightIcon: React.ReactNode
): string => {
	if (leftIcon && rightIcon) {
		return "pl-[38px] pr-[38px]";
	}
	if (leftIcon) {
		return "pl-[38px] pr-[14px]";
	}
	if (rightIcon) {
		return "pr-[38px] pl-[14px]";
	}

	return "px-[14px]";
};
const Input = (props: Props) => {
	const {
		leftIcon,
		rightIcon,
		placeholder,
		text,
		type,
		onChange,
		value,
		disabled,
		error,
		message,
		onClick,
		onFocus,
		name,
		onKeyDown,
		border = true,
		showErrorMessage = true,
		className,
	} = props;
	return (
		<div className={`flex flex-col w-full  gap-y-[4px] ${className}`}>
			{text && <span className="text-sm text-c_gray-500">{text}</span>}
			{/* Input Container */}
			<div className="relative  w-full">
				{/* Left icon */}
				{leftIcon && (
					<div className="absolute left-0 top-0 flex h-full items-center  px-[14px] text-lg text-c_gray-500">
						{leftIcon}
					</div>
				)}
				{/* Input */}
				<input
					className={`h-full w-full rounded-lg bg-c_dark_blue ${
						border && "border"
					} ${error ? "border-red-600" : "border-c_gray-700"}  ${getPadding(
						leftIcon,
						rightIcon
					)} py-[8px] outline-none transition duration-150 focus:border-primary-600 placeholder:c_gray-500
            
          disabled:text-c_gray-700
            
          `}
					value={value}
					onChange={onChange}
					type={type}
					placeholder={placeholder}
					disabled={disabled}
					onFocus={onFocus}
					name={name}
					onKeyDown={onKeyDown}
				/>
				{/* Right icon */}
				{rightIcon && (
					<div
						className="absolute top-0 right-0 flex h-full items-center px-[14px] text-lg text-c_gray-500"
						onClick={onClick}
					>
						{rightIcon}
					</div>
				)}
			</div>
			{message && <span className="text-sm text-c_gray-500">{message}</span>}
			{error && showErrorMessage && (
				<span className="text-sm text-red-600">{error}</span>
			)}
		</div>
	);
};
export default Input;
