// reducer Interfaces
export type UserRole = "root" | "admin" | "user";

export interface Iuser {
	email: string;
	name: string;
	lastname: string;
	id: string;
	avatar?: string | null;
	bio?: string;
	role?: UserRole;
	rank?: string;
	rank_color?: string;
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
