export interface PeerInfo {
	/* UNIQUE ID */
	HWID: string,
	/* Operating System */
	OS: string,
	/* Client Version */
	Version: string
}

export type RegisterEventArgs = [
	username: string,
	password: string,
	email: string,
	allowEmailsDiscard: string,
	peer_info: PeerInfo
]

export type LoginEventArgs = [
	username: string,
	password: string,
	peer_info: PeerInfo
]