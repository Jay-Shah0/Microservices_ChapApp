import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_SOCKET_SERVER_URL;

export const socket = io(URL , {
    autoConnect: false,
    path: "/socket.io/"
});