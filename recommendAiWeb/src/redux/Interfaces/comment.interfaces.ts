export interface ICommentUser {
	id: number;
	name: string;
	lastname: string;
	avatar?: string | null;
	rank?: string;
	rank_color?: string;
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
	author_liked?: boolean;
	author_rating?: number | null;
}

export interface ICommentsResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: IComment[];
}
