import express from 'express';
import { Server } from 'socket.io';

/* Server port */
export const port = process.env.PORT || 8000;

/* Express server */
export const expressApp = express();

/* HTTP server from Express */
export const appServer = expressApp.listen(port, () => console.log('Server listening at port %d', port));

/* Socket.IO server */
export const IO = new Server(appServer, {});