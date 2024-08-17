import { Socket } from 'socket.io';
import { EventInArgs, EventOutArgs } from '../packets/socketEvents';

export class Connection {
	socket: Socket;

	constructor(socket: Socket) {
		this.socket = socket;
	}

	in<T extends keyof EventInArgs>(evt: T, callback: (...args: EventInArgs[T]) => void) {
		this.socket.on(evt as string, (args: any) => {
			if (Array.isArray(args))
				callback(...args as any);
			else
				(callback as any)(args);
		});

		const response = {
			close: () => this.socket.off(evt, callback),
			// add: (param0: any[]) => param0.push(response)
		};

		return response;
	}

	out<T extends keyof EventOutArgs>(evt: T, ...args: EventOutArgs[T]) {
		this.socket.emit(evt, args);
	}
}