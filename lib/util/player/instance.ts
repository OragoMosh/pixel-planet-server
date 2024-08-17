import Emitter from '@orago/lib/emitter';
import { Socket } from 'socket.io';

import { worlds, type World } from '../world/instance';
import { Connection } from './connection';
import { MessageIcon } from '../packets/socketEvents';
import { ClothesPacket, Peer } from '../packets/packets';
import { Vector2i } from '../packets/dataTypes';

export const players: Map<number, Player> = new Map();

export class Player {
	private static peerCount: number = 0;
	public readonly peerID: number = Player.peerCount++;

	currentWorld?: World;
	customEvt = new Emitter();
	clothes: ClothesPacket = {
		SHIRT: -1,
		PANTS: -1,
		SHOES: -1,
		TOOL: -1,
		HAT: -1,
		HAIR: -1,
		BACK: -1,
		HAND: -1,
		FACE: -1,
	};
	position: Vector2i = new Vector2i(0, 0);

	public readonly userID: number;
	public readonly connection: Connection;
	public readonly socket: Socket;

	constructor(userID: number, connection: Connection) {
		this.userID = userID;
		this.connection = connection;
		this.socket = connection.socket;

		players.set(this.userID, this);

		this.socket.on('disconnect', () => {
			players.delete(userID);
		});
	}

	async joinWorld(name: string) {
		const world = await worlds.request(name);

		await this.leaveWorld();

		if (world == null)
			return;

		this.currentWorld = world;
		this.currentWorld.playerJoined(this);
	}

	async leaveWorld() {
		if (this.inWorld() != true)
			return;

		await this.currentWorld.playerLeft(this);

		// @ts-ignore
		delete this.currentWorld;
	}

	Notify(message: string, icon: keyof typeof MessageIcon) {
		this.connection.out('Message', message, MessageIcon[icon]);
	}

	inWorld(): this is { currentWorld: World } {
		return this.currentWorld != null;
	}

	peerData(): Peer {
		return {
			PEER_ID: this.peerID,
			NAME: 'PLAYER',
			CLOTHES: this.clothes,
			PERMISSION_LEVEL: 0,
			DATABASE_ID: this.userID,
			POSITION: this.position
		};
	}
}