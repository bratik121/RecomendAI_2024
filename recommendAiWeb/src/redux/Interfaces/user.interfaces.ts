// reducer Interfaces
export interface Iuser {
	email: string;
	name: string;
	lastname: string;
	id: string;
}

export interface userState {
	isFetching: boolean;
	isAuthenticated: boolean;
	user: Iuser;
	error: string;
}

// Actions interfaces
export interface IRegisterUser {
	email: string;
	password: string;
	name: string;
	lastname: string;
}

export interface ILoginUser {
	email: string;
	password: string;
}
