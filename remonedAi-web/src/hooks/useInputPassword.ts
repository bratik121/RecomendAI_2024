import { useState, useCallback } from "react";
import useInput from "./useInput";

const useInputPassword = (initialValue: string) => {
	const { value, onChange, onFocus, error, onError, reset } =
		useInput(initialValue);
	const [showPassword, setShowPassword] = useState(false);

	const toggleShowPassword = useCallback(() => {
		setShowPassword((prevShowPassword) => !prevShowPassword);
	}, []);

	return {
		value,
		onChange,
		onFocus,
		error,
		onError,
		reset,
		showPassword,
		toggleShowPassword,
	};
};

export default useInputPassword;

export type useInputPasswordType = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	error: string;
	onError: (message: string) => void;
	reset: () => void;
	showPassword: boolean;
	toggleShowPassword: () => void;
};
