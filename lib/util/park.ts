import { ModelCtor } from 'sequelize-typescript';
import ParkTable, { BackgroundsTable, BlocksTable } from '../models/park.database';
import Status from '@orago/lib/status';
import { purifyName } from './assorted';

export interface TileEntry {
	type: number;
	x: number;
	y: number;
	layer: number;
	data?: {
		cooldowns?: {
			[name: string]: number;
		};
		damage?: number;
		hits?: number;
		created?: number;
	};
}

class TileManager<TileModel extends BlocksTable | BackgroundsTable> {
	model: TileModel;

	constructor(model: TileModel) {
		this.model = model;
	}

	buildBlock(x: number, y: number, blockID: number, piece: any) {

	}
}

class ParkOwner {
	static async get(parkID: number): Promise<number | undefined> {
		if (typeof parkID != 'number')
			return undefined;

		return await ParkTable
			.findByPk(parkID)
			.then(e => e?.owner)
	}

	static async owns(userID: number, parkID: number): Promise<boolean> {
		const owner = await this.get(parkID);

		return typeof owner == 'number' && userID === owner;
	}

	static async set(userID: number, parkID: number) {
		const entry = await ParkTable.findByPk(parkID);

		if (entry == null)
			return new Status.Error('No World With This ID');

		await entry.update({
			owner: userID,
			salePrice: null
		});

		return new Status.Success('Successfully Owned');
	}
}


export class WorldManager {
	static Owner = ParkOwner;

	static async existsID(userID: number) {
		return await ParkTable.findByPk(userID) != null;
	}

	static async existsName(name: string) {
		name = purifyName(name);

		return await ParkTable.findOne({ where: { name } }) != null;
	}

	static async getID(name: string) {
		name = purifyName(name);

		if (await this.existsName(name) != true)
			return false;

		const user = await ParkTable.findOne({ where: { name } });

		if (user)
			return user.parkID;

		return false;
	}

	static async create(name: string) {
		name = purifyName(name);

		if (await this.existsName(name))
			return null;

		const { parkID } = await ParkTable.create({
			name,
		});

		return parkID;
	}
}