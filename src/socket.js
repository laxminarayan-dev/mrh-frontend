import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

console.log("Connecting to socket at:", SOCKET_URL);

export const socket = io(SOCKET_URL, {
    path: "/socket.io",
    autoConnect: false,
    transports: ["websocket"], // faster & stable
});
