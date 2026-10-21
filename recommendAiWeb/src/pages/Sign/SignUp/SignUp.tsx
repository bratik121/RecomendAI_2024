import { useEffect } from "react";
import logo from "@/src/assets/logo-removebg-preview.png";
import { Button, Input, Loading } from "@/src/components/common";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { isEmail, isPassword, isName, isLastName } from "@/src/utils";
import { useInput, useInputPassword } from "@/src/hooks";
import { postRegisterUserProcess } from "@/src/redux/actions";
import { RootState } from "@/src/redux/reducers";

const SignUp = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { isFetching, isAuthenticated } = useSelector(
		(state: RootState) => state.user
	);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated]);
	const name = useInput("");
	const lastname = useInput("");
	const email = useInput("");
	const password = useInputPassword("");

	const validate = (): boolean => {
		let flag = true;
		const emailError = isEmail(email.value);
		const passwordError = isPassword(password.value);
		const nameError = isName(name.value);
		const lastnameError = isLastName(lastname.value);

		if (nameError) {
			name.onError(nameError);
			flag = false;
		}

		if (lastnameError) {
			lastname.onError(lastnameError);
			flag = false;
		}

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
		navigate("/sign/in");
	};

	const handleSignUp = () => {
		if (!validate()) return;

		const data = {
			name: name.value,
			lastname: lastname.value,
			email: email.value,
			password: password.value,
		};
		dispatch(postRegisterUserProcess(data));
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
		<div className="w-full h-full px-4 ">
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
						Sign Up
					</h2>
				</div>
				{/* Sign form */}
				<div className=" flex flex-col gap-y-6 px-8 py-6">
					{/* Inputs */}
					<div className="flex flex-col gap-y-2">
						<div className=" flex flex-col gap-y-2 gap-x-2 md:flex-row">
							<Input
								text="Name"
								name="name"
								value={name.value}
								onChange={name.onChange}
								error={name.error}
								onFocus={name.onFocus}
							/>
							<Input
								text="Lastname"
								name="lastname"
								value={lastname.value}
								onChange={lastname.onChange}
								error={lastname.error}
								onFocus={lastname.onFocus}
							/>
						</div>
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
					<div className="flex flex-col gap-y-4 ">
						<Button text="Sign up" onClick={handleSignUp} />
						<Button text="Sign in" fill={false} onClick={handleSignIn} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
