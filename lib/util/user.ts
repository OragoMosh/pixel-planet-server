import Bcrypt from 'bcryptjs';
import Status from '@orago/lib/status';
import { a0 as badUsername, genString } from '@orago/lib/string';
import emailValidator from 'email-validator';

import { UserTable } from './../models/user.database';
import { CoinsTable, InventoryTable } from '../models/user/user.models';
import { ItemHelper, ItemID } from './itemHelper';
import { purifyName } from './assorted';

const UserStatus = {
	noExist: new Status.Error('Cannot find user')
}

class UserCoins {
	static async get(userID: number): Promise<number> {
		const amount = await CoinsTable.findByPk(userID);

		return typeof amount?.coins === 'number' ? amount.coins : 0;
	}

	static async has(userID: number, amount: number): Promise<Status> {
		if (await User.existsID(userID) != true)
			return new Status.Error('Cannot find user');

		if (await this.get(userID) < amount)
			return new Status.Error(`Can't afford this transaction`);

		return new Status.Success('Affordable!');
	}

	static async change(userID: number, coins: number) {
		if (await User.existsID(userID) != true)
			return new Status.Error('Cannot find user');

		const [balance, created] = await CoinsTable.findOrCreate({
			where: { userID }
		});

		// The record already exists, so update the coins value
		if (created != true) {
			await balance
				.update({ coins: balance.coins + coins })
				.catch(error =>
					console.error(
						'Error adding coins:',
						error
					)
				);
		}

		return new Status.Success();
	}

	static async set(userID: number, coins: number) {
		if (await User.existsID(userID) != true)
			return UserStatus.noExist;

		const [balance] = await CoinsTable.findOrCreate({
			where: { userID },
			defaults: { coins }
		});

		await balance.update({ coins });

		return new Status.Success();
	}
}

class UserInventory {
	static status = {
		badItem: new Status.Error('Invalid Item ID')
	};

	static async has(userID: number, item: ItemID, amount: number) {
		const entry = await InventoryTable.findOne({
			where: {
				userID,
				item
			}
		});

		if (entry != null)
			if (entry.amount >= amount || amount === -1)
				return new Status.Success('User has enough!', entry);

		return new Status.Error('User does not have enough');
	}

	static async give(userID: number, item: ItemID, amount: number) {
		if (await User.existsID(userID) != true)
			return UserStatus.noExist;

		if (ItemHelper.validItem(item) != true)
			return this.status.badItem;

		const has = await this.has(userID, item, -1);

		if (has.status == true) {
			has.data.increment('amount', { by: amount });

			return new Status.Success();
		}
		else {
			await InventoryTable.create({
				userID,
				item,
				amount
			});
		}
	}

	static async remove(userID: number, item: ItemID, amount: number) {
		if (await User.existsID(userID) != true)
			return UserStatus.noExist;

		if (ItemHelper.validItem(item) != true)
			return this.status.badItem;

		const entry = await InventoryTable.findOne({ where: { userID, item } });

		if (entry == null)
			return new Status.Error('No Item With This ID');

		let leftOver = entry.amount - amount;

		if (typeof entry.amount == 'number' && leftOver >= 0) {
			if (leftOver > 0) {
				await entry.update({ amount: leftOver });

				return new Status.Success(
					'Subtracted',
					{ afforded: true }
				);
			}

			await entry.destroy();

			return new Status.Success(
				'Deleted',
				{ afforded: true }
			);
		}

		await entry.destroy();

		return new Status.Success(
			'Deleted But Couldn\'t afford.',
			{ afforded: false }
		);
	}
}

class UserPassword {
	static async set(userID: number, passwordUnhashed: string) {
		if (await User.existsID(userID) != true)
			return new Status.Error('User Does Not Exist');

		const salt = await Bcrypt.genSalt(10);
		const hashed = await Bcrypt.hash(passwordUnhashed, salt);
		const userEntry = await UserTable.findByPk(userID);

		if (userEntry == null)
			return new Status.Error('Cannot find user');

		await userEntry.update({ password: hashed });

		return new Status.Success(
			'Successfully set password!'
		);
	}

	static async validate(userID: number, inputPassword: string) {
		if (await User.existsID(userID) != true)
			return UserStatus.noExist

		const user = await UserTable.findByPk(userID);

		if (user == null)
			return UserStatus.noExist

		const { password: userPass } = user;

		const matched = await Bcrypt.compare(
			inputPassword,
			userPass
		);

		if (matched)
			return new Status.Success();

		return new Status.Error('Invalid password');
	}

	static async setRandomPassword(userID: number) {
		return await this.set(
			userID,
			genString(10)
		);
	}
}

class UserUsername {
	static async get(userID: number) {
		return await UserTable.findOne({ where: { userID } }).then(user => user?.username);
	}

	static async getNickname(userID: number) {
		return await UserTable.findOne({ where: { userID } }).then(user => user?.nickname ?? user?.username);
	}

	static async exists(username: string) {
		username = purifyName(username);

		return await UserTable.findOne({ where: { username } }) != null;
	}
}


export class User {
	static Coins = UserCoins;
	static Inventory = UserInventory;
	static Password = UserPassword;
	static Username = UserUsername;

	static async existsID(userID: number) {
		return await UserTable.findByPk(userID) != null;
	}

	static existsUsername = UserUsername.exists;

	static async getID(username: string) {
		username = purifyName(username);

		if (await this.existsUsername(username) != true)
			return;

		const user = await UserTable.findOne({ where: { username } });

		if (user)
			return user.userID;
	}

	static async register(username: string, password: string, email: string,) {
		username = username?.toLowerCase();

		if (username.length < 3)
			return new Status.Error('Username must be 3 characters or higher... also how are you reading this message?');

		else if (username.length > 16)
			return new Status.Error('Username must be 16 characters or lower... also how are you reading this message?');

		else if (badUsername(username))
			return new Status.Error('Invalid character in username');

		else if (await this.existsUsername(username))
			return new Status.Error('Username already exists!');

		else if (emailValidator.validate(email) !== true)
			return new Status.Error('Please enter a valid email.');

		const { userID } = await UserTable.create({
			username,
			nickname: username,
			// password,
			email,
		});

		await User.Password.set(userID, password);

		return new Status.Success('Successfully registered', { userID });
	}
}