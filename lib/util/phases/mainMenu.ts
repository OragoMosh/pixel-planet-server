import { Vector2i } from '../packets/dataTypes';
import { WorldPacket } from '../packets/packets';
import { Player } from '../player/instance';
import ItemData from '../itemData.json';

const tileMap: Map<number, number> = new Map();
let highest = 0;

for (const [key, v] of Object.entries(ItemData)) {
	const id = Number(key);
	const value: any = v;
	const tid: number = value.TILESET_ID;

	if (typeof tid == 'number') {
		tileMap.set(tid, id);
		if (tid > highest) highest = tid;
	}
}

function resolveTile(x: number, y: number, width: number, height: number): number {
	const sq = Math.sqrt(highest);

	if (x < sq && y < sq)
		return tileMap.get(Math.min(Math.floor(y * sq + x), highest)) as number ?? tileMap.get(0);

	return -1;
}

export function mainMenu(player: Player) {
	const { connection } = player;

	const joinReq = connection.in('WorldJoin', (name: string) => {
		if (typeof name != 'string')
			return player.Notify('Invalid World', 'alert');

		const packet: WorldPacket = {
			WORLD_SIZE: new Vector2i(100, 100),
			BLOCK_ARRAY: [],
			DROP_DATA: {},
			NAME: 'Balls',
			OWNER_ID: 0,
			OWNER_NAME: 'Testo',
			ADMIN_IDS: [],
			BROKEN_BLOCKS: {},
			BLOCK_METADATA: {},
			BACKGROUND: 0,
			LOW_GRAVITY: false,
			PEERS: [player.peerData()]
		};

		for (let i = 0; i < 2; i++) {
			const layer: number[][] = [];
			packet.BLOCK_ARRAY.push(layer);

			for (let x = 0; x < packet.WORLD_SIZE.x; x++) {
				const list: number[] = [];
				layer.push(list);

				for (let y = 0; y < packet.WORLD_SIZE.y; y++) {
					list.push(
						resolveTile(x, y, packet.WORLD_SIZE.x, packet.WORLD_SIZE.y)
					);
				}
			}
		}

		connection.out('WorldJoin', packet, [[0, 1], [16, 1], [32, 20]], 0, player.clothes, 0);
		player.Notify('Joining!', 'megaphone');
	});
}