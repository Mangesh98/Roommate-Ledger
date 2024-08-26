export interface MembersType {
	isPending: boolean;
	userId: string;
	userName: string;
	paidStatus: boolean;
	_id: string;
}
export interface EntryType {
	status: boolean;
	_id: string;
	room: string;
	date: Date;
	description: string;
	amount: number;
	paidBy: string;
	createdAt: Date;
	members: MembersType[];
}

export interface UpdateEntry {
	entryId: string;
	paidBy: string;
	amount: number;
	userId: string;
}

interface LedgerMembersType {
	_id: string;
	userId: string;
	userName: string;
	payable: number;
	receivable: number;
}

export interface LedgerType {
	room: string;
	userId: string;
	updatedAt: Date;
	members: LedgerMembersType[];
}
export interface CurrentUser {
	userId: string;
	userName: string;
	email: string;
	roomId: string;
	roomName: string;
}

export interface RoomMembers {
	_id: string;
	userId: string;
	userName: string;
}

export interface EntryFormData {
	description: string;
	price?: number;
	date: string;
	selectedMembers: string[];
}

export interface Token {
	email: string;
	iat: string;
	name: string;
	room: string;
	userId: string;
}
