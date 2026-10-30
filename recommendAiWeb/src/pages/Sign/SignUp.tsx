import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useInput, useInputPassword } from "@/src/hooks";
import { postRegisterUserProcess } from "@/src/redux/actions";
import { RootState } from "@/src/redux/reducers";
import { isEmail, isPassword, isName, isLastName } from "@/src/utils";
import { Button } from "@/src/components/ui/button";
import { Spinner } from "@/src/components/Spinner";
import { TextField, PasswordField } from "./AuthField";
import logo from "@/src/assets/logo-removebg-preview.png";

export function SignUp() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useTranslation("auth");
	const { isFetching, isAuthenticated, error } = useSelector(
		(state: RootState) => state.user
	);

	const name = useInput("");
	const lastname = useInput("");
	const email = useInput("");
	const password = useInputPassword("");

	useEffect(() => {
		if (isAuthenticated) navigate("/");
	}, [isAuthenticated, navigate]);

	const validate = () => {
		let ok = true;
		const checks: Array<{ set: (m: string) => void; message: string }> = [
			{ set: name.onError, message: isName(name.value) },
			{ set: lastname.onError, message: isLastName(lastname.value) },
			{ set: email.onError, message: isEmail(email.value) },
			{ set: password.onError, message: isPassword(password.value) },
		];
		for (const check of checks) {
			if (check.message) {
				check.set(check.message);
				ok = false;
			}
		}
		return ok;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;
		dispatch(
			postRegisterUserProcess({
				name: name.value,
				lastname: lastname.value,
				email: email.value,
				password: password.value,
			})
		);
	};

	return (
		<div className="flex flex-col">
			<div className="mb-8 flex flex-col items-center gap-3">
				<img src={logo} alt="What2Watch" className="h-14 w-14 object-contain" />
				<h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
					{t("signUp")}
				</h1>
				<p className="text-sm text-text-muted">{t("signUpSubtitle", { ns: "auth" })}</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4" noValidate>
				<div className="grid gap-4 sm:grid-cols-2">
					<TextField
						label={t("name")}
						name="name"
						value={name.value}
						onChange={name.onChange}
						onFocus={name.onFocus}
						error={name.error}
						autoComplete="given-name"
					/>
					<TextField
						label={t("lastname")}
						name="lastname"
						value={lastname.value}
						onChange={lastname.onChange}
						onFocus={lastname.onFocus}
						error={lastname.error}
						autoComplete="family-name"
					/>
				</div>
				<TextField
					label={t("email")}
					name="email"
					type="email"
					value={email.value}
					onChange={email.onChange}
					onFocus={email.onFocus}
					error={email.error}
					autoComplete="email"
				/>
				<PasswordField
					label={t("password")}
					name="password"
					value={password.value}
					onChange={password.onChange}
					onFocus={password.onFocus}
					error={password.error}
					show={password.showPassword}
					onToggle={password.toggleShowPassword}
					autoComplete="new-password"
				/>

				{error && (
					<p className="rounded-lg border border-danger-soft bg-danger-soft/60 px-3 py-2 text-sm text-danger">
						{error}
					</p>
				)}

				<Button type="submit" className="w-full" size="lg" disabled={isFetching}>
					{isFetching ? <Spinner /> : t("signUpButton")}
				</Button>
			</form>

			<p className="mt-6 text-center text-sm text-text-muted">
				{t("haveAccount", { ns: "auth" })}{" "}
				<Link to="/sign/in" className="font-semibold text-accent hover:underline">
					{t("signIn")}
				</Link>
			</p>
		</div>
	);
}
