export interface IApiResponse {
	code: boolean;
	message: string;
	data: any;
}

export interface reduxAction {
	type: string;
	payload: any;
}
