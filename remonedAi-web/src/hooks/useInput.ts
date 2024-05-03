import { useState, useCallback } from "react";

const useInput = (initialValue: string) => {
	const [value, setValue] = useState(initialValue);
	const [error, setError] = useState("");

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const onFocus = () => {
		setError("");
	};
	const onError = (message: string) => {
		setError(message);
	};
	const reset = useCallback(() => {
		setValue("");
	}, []);
	return { value, onChange, onFocus, error, onError, reset, setValue };
};

export default useInput;

export type useInputType = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	error: string;
	onError: (message: string) => void;
	reset: () => void;
	setValue: React.Dispatch<React.SetStateAction<string>>;
};
