export interface ICommentUser {
	id: number;
	name: string;
	lastname: string;
}

export interface IComment {
	id: number;
	body: string;
	created_at: string;
	updated_at: string;
	is_deleted: boolean;
	is_edited: boolean;
	can_edit: boolean;
	user: ICommentUser;
	parent: number | null;
	replies?: IComment[];
}

export interface ICommentsResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: IComment[];
}
