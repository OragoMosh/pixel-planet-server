import { Vector2, Vector2i } from './dataTypes';
import { ClothesPacket, InventoryPacket, WorldPacket } from './packets';

export interface EventInArgs {
	Version: [currentVersion: number];
	Login: [username: string, password: string];
	Register: [username: string, password: string];

	WorldJoin: [name: string];
	WorldLeave: [];

	PlaceBlock: [id: number, coordinates: any, metadata: any];
	BreakBlock: [position: any];

	UpdatePosition: [Vector2, current_state: number, _direction: boolean];
	EquipClothing: [itemID: number];
	ShopPurchase: [pack_id: string];
	Craft: [firstID: number, secondID: number, firstAmount: number, secondAmount: number];
	Grind: [itemID: number, amount: number];

	ListItem: [itemName: string, minPrice: number, maxPrice: number, page: number];
	SearchMarketplace: [item_name: string, minPrice: number, maxPrice: number, page: number];
	BuyListing: [id: number];

	SetBlockMetadata: [position: Vector2i, metadata_info: object];
	WorldClaim: [];
	ItemDrop: [itemID: number, amount: number];
	ItemDropPickup: [dropID: number];
};

export enum MessageIcon {
	chestuh,
	megaphone,
	alert,
	lock,
	trophy
}



export interface EventOutArgs {
	Version: [boolean];
	Login: [boolean, username?: string, userID?: number];
	Register: [boolean];
	Message: [message: string, icon?: MessageIcon] | [message: 'Success creating account!'];
	WorldJoin: [
		WorldPacket,
		InventoryPacket,
		bits: number,
		clothes: ClothesPacket,
		permissionLevel: number
	];
}

export enum EventCustom {
	joinWorld = 'JoinWorld'
}

export enum EventCustomReturn {
	joinWorld = 'JoinWorld',
	serverMessage = 'ServerMessage',
	consoleMessage = 'ConsoleMessage',
	privateMessage = 'PrivateMessage',
	messageHandling = 'MessageHandling',
	messageDisclaimer = 'MessageDisclaimer',
	tradeRequestMessage = 'TradeRequest',

	// ! Disclaimer: Complex Method
	recieveChat = 'RecieveChat'
}