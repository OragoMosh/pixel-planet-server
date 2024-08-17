import { WorldManager } from '../park.js';
import type { Player } from '../player/instance.js';
import { EventCustomReturn } from '../packets/socketEvents.js';
import { User } from '../user.js';


class ActiveWorlds extends Map<number, World> {
	constructor() {
		super();
	}

	async request(name: string): Promise<World | null> {
		if (await WorldManager.existsName(name) != true)
			await WorldManager.create(name);

		const id = await WorldManager.getID(name);

		if (id == false)
			return null;

		const existing = this.get(id);

		if (existing)
			return existing;

		return new World(id);
	}
}

export const worlds = new ActiveWorlds();

export class World {
	players: Set<Player> = new Set();
	id: number;

	constructor(id: number) {
		this.id = id;

		worlds.set(this.id, this);
	}

	close() {
		worlds.delete(this.id)
	}

	async playerJoined(player: Player) {
		this.players.add(player);

		const nickname = await User.Username.getNickname(player.userID);

		// this.serverMessage(this.everyone, `${nickname} has joined!`);
	}

	get everyone() {
		return Array.from(this.players.values());
	}

	serverMessage(who: Player[], message: string, icon?: string) {
		// this.broadcast(
		// 	who,
		// 	'ServerMessage',
		// 	[message, icon ?? StatusIcon]
		// );
	}

	async playerLeft(player: Player) {
		this.players.delete(player);
	}

	broadcastEveryone(event: `${EventCustomReturn}`, ...args: any[]) {
		this.broadcast(this.everyone, event, ...args);
	}

	broadcast(players: Player[], event: `${EventCustomReturn}`, ...args: any[]) {
		// for (const player of players)
		// player.returnEvent(event, ...args);
	}
}