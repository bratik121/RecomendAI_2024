import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";

type TextFieldProps = {
	label: string;
	name: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
	error?: string;
	placeholder?: string;
	autoComplete?: string;
};

export function TextField({
	label,
	name,
	type = "text",
	value,
	onChange,
	onFocus,
	error,
	placeholder,
	autoComplete,
}: TextFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={name}>{label}</Label>
			<Input
				id={name}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				onFocus={onFocus}
				placeholder={placeholder}
				autoComplete={autoComplete}
				aria-invalid={!!error}
				className={cn(error && "border-danger focus-visible:ring-danger/40")}
			/>
			{error && <p className="text-xs font-medium text-danger">{error}</p>}
		</div>
	);
}

type PasswordFieldProps = {
	label: string;
	name: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
	error?: string;
	show: boolean;
	onToggle: () => void;
	autoComplete?: string;
};

export function PasswordField({
	label,
	name,
	value,
	onChange,
	onFocus,
	error,
	show,
	onToggle,
	autoComplete,
}: PasswordFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={name}>{label}</Label>
			<div className="relative">
				<Input
					id={name}
					name={name}
					type={show ? "text" : "password"}
					value={value}
					onChange={onChange}
					onFocus={onFocus}
					autoComplete={autoComplete}
					aria-invalid={!!error}
					className={cn("pr-11", error && "border-danger focus-visible:ring-danger/40")}
				/>
				<button
					type="button"
					onClick={onToggle}
					aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
					className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
				>
					{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
			</div>
			{error && <p className="text-xs font-medium text-danger">{error}</p>}
		</div>
	);
}
