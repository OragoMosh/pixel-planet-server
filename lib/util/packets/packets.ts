import { Vector2i } from './dataTypes';

export type InventoryPacket = [itemID: number, amount: number][];

export interface ClothesPacket {
	SHIRT: number;
	PANTS: number;
	SHOES: number;
	TOOL: number;
	HAT: number;
	HAIR: number;
	BACK: number;
	HAND: number;
	FACE: number;
}

export interface Peer {
	PEER_ID: number;
	NAME: string;
	CLOTHES: ClothesPacket;
	PERMISSION_LEVEL: number;
	DATABASE_ID: number;
	POSITION: Vector2i;
}

export interface WorldPacket {
	WORLD_SIZE: Vector2i;
	BLOCK_ARRAY: number[][][];
	DROP_DATA: {
		[pos: `${number},${number}`]: {
			dropped: []
		}
	};
	NAME: string;
	OWNER_ID: number;
	OWNER_NAME: string;
	ADMIN_IDS: number[];
	BROKEN_BLOCKS: {
		[pos: `${number}, ${number}, ${number}`]: {
			brokenness: number;
			time: number;
		}
	};
	BLOCK_METADATA: {

	};
	BACKGROUND: number;
	LOW_GRAVITY: boolean;
	PEERS: Peer[];
}