import { useEffect } from "react";
import { Button, Input, Loading } from "@/src/components/common";
import { useNavigate } from "react-router-dom";
import logo from "@/src/assets/logo-removebg-preview.png";
import { useDispatch, useSelector } from "react-redux";
import { useInput, useInputPassword } from "@/src/hooks";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { postLoginUserProcess } from "@/src/redux/actions";
import { RootState } from "@/src/redux/reducers";
import { isEmail, isPassword } from "@/src/utils";

const SignIn = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { isFetching, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);

	const email = useInput("");
	const password = useInputPassword("");

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated]);

	const validate = (): boolean => {
		let flag = true;
		const emailError = isEmail(email.value);
		const passwordError = isPassword(password.value);

		if (emailError) {
			email.onError(emailError);
			flag = false;
		}

		if (passwordError) {
			password.onError(passwordError);
			flag = false;
		}

		return flag;
	};
	const handleSignIn = () => {
		if (!validate()) return;
		const data = {
			email: email.value,
			password: password.value,
		};
		dispatch(postLoginUserProcess(data));
	};

	const handleSignUp = () => {
		navigate("/sign/up");
	};

	const handleLogoClick = () => {
		navigate("/");
	};

	if (isFetching)
		return (
			<div className="w-full h-full flex justify-center items-center">
				<Loading />
			</div>
		);

	return (
		<div className="w-full h-full px-4  ">
			<div className=" flex flex-col gap-y-2 py-4">
				{/* Title */}
				<div className="flex flex-col items-center gap-y-2">
					<div
						className="h-28 aspect-square cursor-pointer"
						onClick={handleLogoClick}
					>
						<img src={logo} alt="" />
					</div>
					<h2 className="text-white font-custom font-semibold text-4xl">
						Sign In
					</h2>
				</div>
				{/* Sign form */}
				<div className=" flex flex-col gap-y-8 px-8 py-6">
					{/* Inputs */}
					<div className="flex flex-col gap-y-2">
						<Input
							type="email"
							text="Email"
							name="email"
							value={email.value}
							onChange={email.onChange}
							error={email.error}
							onFocus={email.onFocus}
						/>
						<Input
							text="Password"
							type={password.showPassword ? "text" : "password"}
							name="password"
							value={password.value}
							onChange={password.onChange}
							error={password.error}
							onFocus={password.onFocus}
							onClick={password.toggleShowPassword}
							rightIcon={
								password.showPassword !== true ? (
									<AiFillEye className="cursor-pointer" />
								) : (
									<AiFillEyeInvisible className="cursor-pointer" />
								)
							}
						/>
					</div>
					{/* Buttons */}
					<div className="flex flex-col gap-y-4 mt-2">
						<Button text="Sign in" onClick={handleSignIn} />
						<Button text="Sign up" fill={false} onClick={handleSignUp} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
