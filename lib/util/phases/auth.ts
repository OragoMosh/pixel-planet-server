import { Game__ } from '../game/main';
import type { Connection } from '../player/connection';
import { Player } from '../player/instance';
import { MessageIcon } from '../packets/socketEvents';
import { User } from '../user';
import { mainMenu } from './mainMenu';

export function startAuth(connection: Connection) {
	const versionReq = connection.in('Version', (current) => {
		connection.out('Version', Game__.version == current);
		versionReq.close();
	});

	const registerReq = connection.in('Register', async (username, password) => {
		if (Game__.maintenance)
			return connection.out('Message', 'Servers are on maintenance!', MessageIcon.alert);

		if (typeof username != 'string' || typeof password != 'string') {
			connection.out('Message', 'Invalid Input!', MessageIcon.alert);
			connection.out('Register', false);
			return;
		}

		const registration = await User.register(username, password, 'unset@gmail.com');

		if (registration.status) {
			connection.out('Message', 'Success creating account!');
			registerReq.close();
		}

		connection.out('Message', registration.response, MessageIcon.alert);
		connection.out('Register', registration.status);
	});

	const loginReq = connection.in('Login', async (username, password) => {
		if (Game__.maintenance)
			return connection.out('Message', 'Servers are on maintenance!', MessageIcon.alert);

		if (typeof username != 'string' || typeof password != 'string') {
			connection.out('Message', 'Bad Inputs', MessageIcon.alert);
			connection.out('Login', false);

			return;
		}

		username = username.toLowerCase();

		const userID = await User.getID(username);

		if (userID == null) {
			connection.out('Message', 'Username does not exist', MessageIcon.alert);
			connection.out('Login', false);
			return;
		}

		const valid = await User.Password.validate(userID, password);

		if (valid.status != true) {
			connection.out('Message', valid.response, MessageIcon.lock);
			connection.out('Login', false);
			return;
		}

		createPlayer(userID);
		connection.out('Login', true, username, userID);
	});

	function createPlayer(userID: number) {
		const player = new Player(userID, connection);
		mainMenu(player);

		registerReq.close();
		loginReq.close();
	}
}