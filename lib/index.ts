import { startAuth } from './util/phases/auth';
import { Connection } from './util/player/connection';
import { IO } from './util/uses';

IO.on('connect', socket => {
	const connection = new Connection(socket);

	startAuth(connection);

	socket.onAny((event, ...args) => {
		console.log('Got an event', event, args);
	});
});