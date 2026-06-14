import { Socket, io } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const SOCKET_OPTS = {
  autoConnect: false,
  transports: ["websocket", "polling"] as string[],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
};

let publicSocketInstance: Socket | null = null;
let privateSocketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (typeof window === "undefined") {
    throw new Error("Socket can only be initialized on the client side");
  }

  if (publicSocketInstance && publicSocketInstance.connected) {
    return publicSocketInstance;
  }

  publicSocketInstance = io(WS_URL, SOCKET_OPTS);

  return publicSocketInstance;
}

export const getAuthSocket = (token: string): Socket => {
  if (typeof window === "undefined") {
    throw new Error("Socket can only be initialized on the client side");
  }

  if (privateSocketInstance && privateSocketInstance.connected) {
    return privateSocketInstance;
  }

  privateSocketInstance = io(WS_URL, { ...SOCKET_OPTS, auth: { token } });

  return privateSocketInstance;
}
